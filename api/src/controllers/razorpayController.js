const prisma = require("../lib/prisma");
const { verifyAccessToken } = require("../lib/auth");
const {
  buildAuthorizeUrl,
  parseAndVerifyState,
  exchangeCodeForTokens,
  createMerchantWebhooks,
} = require("../lib/razorpay");

// GET /auth/razorpay/connect
// Requires authenticated organization admin
async function connectRazorpay(req, res) {
  try {
    // Support token from Authorization header or query string so we can redirect via window.location
    let token;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid access token.",
      });
    }

    const decoded = verifyAccessToken(token);
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired access token.",
      });
    }

    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { adminOrganization: true },
    });

    if (!user || user.role !== "ORGANIZATION" || user.isMember) {
      return res.status(403).json({
        success: false,
        message: "Only organization admins can connect Razorpay.",
      });
    }

    if (!user.adminOrganization) {
      return res.status(400).json({
        success: false,
        message: "User does not have an organization.",
      });
    }

    const organizationId = user.adminOrganization.id;
    const authorizeUrl = buildAuthorizeUrl(organizationId);

    // For browser navigation, a 302 redirect is convenient
    return res.redirect(authorizeUrl);
  } catch (error) {
    console.error("Razorpay connect error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to initiate Razorpay connection.",
    });
  }
}

// GET /auth/razorpay/callback
// Handles OAuth callback from Razorpay
async function razorpayCallback(req, res) {
  try {
    const { code, state, error, error_description } = req.query;

    if (error) {
      console.error("Razorpay OAuth error:", error, error_description);
      return res.status(400).json({
        success: false,
        message: `Razorpay OAuth failed: ${error_description || error}`,
      });
    }

    if (!code || !state) {
      return res.status(400).json({
        success: false,
        message: "Missing code or state in Razorpay callback.",
      });
    }

    const organizationId = parseAndVerifyState(state);

    const tokens = await exchangeCodeForTokens(code);

    const connection = await prisma.organizationRazorpayConnection.upsert({
      where: { organizationId },
      update: {
        razorpayMerchantId: tokens.razorpayMerchantId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.tokenExpiresAt,
        merchantKeyId: tokens.merchantKeyId,
      },
      create: {
        organizationId,
        razorpayMerchantId: tokens.razorpayMerchantId,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        tokenExpiresAt: tokens.tokenExpiresAt,
        merchantKeyId: tokens.merchantKeyId,
      },
    });

    // Create webhooks for this merchant
    try {
      await createMerchantWebhooks(connection);
    } catch (whErr) {
      console.error("Failed to create Razorpay webhooks:", whErr);
      // Do not fail the whole flow – connection is still valid
    }

    // Redirect back to dashboard with a success flag
    const redirectUrl = `${process.env.FRONTEND_BASE_URL || "http://localhost:3000"}/dashboard/org/settings?razorpay=connected`;

    return res.redirect(redirectUrl);
  } catch (error) {
    console.error("Razorpay callback error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to complete Razorpay connection.",
    });
  }
}

module.exports = {
  connectRazorpay,
  razorpayCallback,
};
