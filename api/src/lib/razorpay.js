const axios = require("axios");
const crypto = require("crypto");
const prisma = require("./prisma");

const RAZORPAY_OAUTH_AUTHORIZE_URL = process.env.RAZORPAY_OAUTH_AUTHORIZE_URL || "https://auth.razorpay.com/authorize";
const RAZORPAY_OAUTH_TOKEN_URL = process.env.RAZORPAY_OAUTH_TOKEN_URL || "https://auth.razorpay.com/token";
const RAZORPAY_API_BASE_URL = process.env.RAZORPAY_API_BASE_URL || "https://api.razorpay.com/v1";
const RAZORPAY_CLIENT_ID = process.env.RAZORPAY_CLIENT_ID;
const RAZORPAY_CLIENT_SECRET = process.env.RAZORPAY_CLIENT_SECRET;
const RAZORPAY_REDIRECT_URI = process.env.RAZORPAY_REDIRECT_URI;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
const RAZORPAY_STATE_SECRET = process.env.RAZORPAY_STATE_SECRET || "change-this-state-secret";

function buildState(organizationId) {
  const payload = JSON.stringify({ organizationId, ts: Date.now() });
  const signature = crypto
    .createHmac("sha256", RAZORPAY_STATE_SECRET)
    .update(payload)
    .digest("hex");
  return Buffer.from(JSON.stringify({ p: payload, s: signature })).toString("base64url");
}

function parseAndVerifyState(state) {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const { p, s } = JSON.parse(decoded);
    const expected = crypto
      .createHmac("sha256", RAZORPAY_STATE_SECRET)
      .update(p)
      .digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(s, "hex"))) {
      throw new Error("Invalid state signature");
    }
    const payload = JSON.parse(p);
    return payload.organizationId;
  } catch (err) {
    throw new Error("Invalid state parameter");
  }
}

function buildAuthorizeUrl(organizationId) {
  if (!RAZORPAY_CLIENT_ID || !RAZORPAY_REDIRECT_URI) {
    throw new Error("Razorpay OAuth is not configured correctly on the server");
  }

  const state = buildState(organizationId);
  const url = new URL(RAZORPAY_OAUTH_AUTHORIZE_URL);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", RAZORPAY_CLIENT_ID);
  url.searchParams.set("redirect_uri", RAZORPAY_REDIRECT_URI);
  url.searchParams.set("scope", "read_write");
  url.searchParams.set("state", state);

  return url.toString();
}

async function exchangeCodeForTokens(code) {
  if (!RAZORPAY_CLIENT_ID || !RAZORPAY_CLIENT_SECRET || !RAZORPAY_REDIRECT_URI) {
    throw new Error("Razorpay OAuth is not configured correctly on the server");
  }

  const params = new URLSearchParams();
  params.set("grant_type", "authorization_code");
  params.set("code", code);
  params.set("redirect_uri", RAZORPAY_REDIRECT_URI);
  params.set("client_id", RAZORPAY_CLIENT_ID);
  params.set("client_secret", RAZORPAY_CLIENT_SECRET);

  const { data } = await axios.post(RAZORPAY_OAUTH_TOKEN_URL, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  // Razorpay typically returns: access_token, refresh_token, expires_in, razorpay_user_id, etc.
  const { access_token, refresh_token, expires_in, razorpay_user_id, key_id } = data;

  if (!access_token || !refresh_token || !razorpay_user_id) {
    throw new Error("Invalid token response from Razorpay");
  }

  const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);

  return {
    accessToken: access_token,
    refreshToken: refresh_token,
    razorpayMerchantId: razorpay_user_id,
    merchantKeyId: key_id || null,
    tokenExpiresAt: expiresAt,
  };
}

async function refreshAccessToken(connection) {
  if (!RAZORPAY_CLIENT_ID || !RAZORPAY_CLIENT_SECRET) {
    throw new Error("Razorpay OAuth is not configured correctly on the server");
  }

  const params = new URLSearchParams();
  params.set("grant_type", "refresh_token");
  params.set("refresh_token", connection.refreshToken);
  params.set("client_id", RAZORPAY_CLIENT_ID);
  params.set("client_secret", RAZORPAY_CLIENT_SECRET);

  const { data } = await axios.post(RAZORPAY_OAUTH_TOKEN_URL, params.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const { access_token, refresh_token, expires_in, razorpay_user_id, key_id } = data;

  const expiresAt = new Date(Date.now() + (expires_in || 3600) * 1000);

  const updated = await prisma.organizationRazorpayConnection.update({
    where: { id: connection.id },
    data: {
      accessToken: access_token,
      refreshToken: refresh_token || connection.refreshToken,
      tokenExpiresAt: expiresAt,
      razorpayMerchantId: razorpay_user_id || connection.razorpayMerchantId,
      merchantKeyId: key_id || connection.merchantKeyId,
    },
  });

  return updated;
}

async function getValidAccessTokenForOrganization(organizationId) {
  let connection = await prisma.organizationRazorpayConnection.findUnique({
    where: { organizationId },
  });

  if (!connection) {
    throw new Error("Organization has not connected Razorpay");
  }

  const now = new Date();
  // Refresh if token is about to expire in the next 60 seconds
  if (connection.tokenExpiresAt && connection.tokenExpiresAt.getTime() - now.getTime() < 60 * 1000) {
    connection = await refreshAccessToken(connection);
  }

  return connection;
}

async function createMerchantWebhooks(connection) {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
  }

  const webhookUrl = process.env.RAZORPAY_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("RAZORPAY_WEBHOOK_URL is not configured");
  }

  const headers = {
    Authorization: `Bearer ${connection.accessToken}`,
    "Content-Type": "application/json",
  };

  const body = {
    url: webhookUrl,
    active: true,
    events: {
      "payment.captured": true,
      "payment.failed": true,
      "refund.processed": true,
    },
    secret: RAZORPAY_WEBHOOK_SECRET,
  };

  await axios.post(`${RAZORPAY_API_BASE_URL}/webhooks`, body, { headers });
}

async function createOrderForBooking(connection, booking, appointment) {
  const headers = {
    Authorization: `Bearer ${connection.accessToken}`,
    "Content-Type": "application/json",
  };

  const amount = (booking.totalAmount || 0) * 100; // convert to paise

  if (!amount || amount <= 0) {
    throw new Error("Invalid booking amount for Razorpay order");
  }

  const body = {
    amount,
    currency: "INR",
    receipt: booking.id,
    payment_capture: 1,
    notes: {
      bookingId: booking.id,
      appointmentId: appointment.id,
      organizationId: appointment.organizationId,
    },
  };

  const { data } = await axios.post(`${RAZORPAY_API_BASE_URL}/orders`, body, { headers });

  return data;
}

function verifyWebhookSignature(rawBody, signature) {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");
  }

  const expected = crypto
    .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");

  return crypto.timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(signature, "hex"));
}

module.exports = {
  buildAuthorizeUrl,
  parseAndVerifyState,
  exchangeCodeForTokens,
  getValidAccessTokenForOrganization,
  createMerchantWebhooks,
  createOrderForBooking,
  verifyWebhookSignature,
};
