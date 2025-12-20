const prisma = require('../lib/prisma');
const {
  hashPassword,
  verifyPassword,
  generateAccessToken,
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeAllUserRefreshTokens,
  updateRefreshTokenLastUsed,
  getCurrentSession,
  createEmailVerificationToken,
  verifyEmailVerificationToken,
  markEmailVerificationTokenUsed,
  createPasswordResetToken,
  verifyPasswordResetToken,
  markPasswordResetTokenUsed,
} = require('../lib/auth');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
} = require('../lib/mailer');
const {
  parseUserAgent,
  generateDeviceName,
  getClientIp,
} = require('../utils/deviceParser');

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
};

/**
 * Register a new user
 */
async function register(req, res) {
  try {
    const { email, password, name, role, business } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format.',
      });
    }

    // Password strength validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    // Validate role
    const userRole = role || 'USER';
    if (!['USER', 'ORGANIZATION'].includes(userRole)) {
      return res.status(400).json({
        success: false,
        message: 'Role must be either USER or ORGANIZATION.',
      });
    }

    // Validate business data for ORGANIZATION role
    if (userRole === 'ORGANIZATION') {
      if (!business || !business.name || !business.location) {
        return res.status(400).json({
          success: false,
          message: 'Business name and location are required for ORGANIZATION role.',
        });
      }
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user and business in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name: name || null,
          role: userRole,
        },
      });

      // Create business if role is ORGANIZATION
      let businessData = null;
      if (userRole === 'ORGANIZATION') {
        businessData = await tx.business.create({
          data: {
            name: business.name,
            location: business.location,
            workingHours: business.workingHours || null,
            description: business.description || null,
            userId: user.id,
          },
        });
      }

      return { user, business: businessData };
    });

    // Generate email verification token
    const verificationToken = await createEmailVerificationToken(result.user.id, email);

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    const responseData = {
      userId: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
    };

    if (result.business) {
      responseData.business = {
        id: result.business.id,
        name: result.business.name,
        location: result.business.location,
      };
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: responseData,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration.',
    });
  }
}

/**
 * Verify email address
 */
async function verifyEmail(req, res) {
  try {
    const { token, email } = req.query;

    if (!token || !email) {
      return res.status(400).json({
        success: false,
        message: 'Token and email are required.',
      });
    }

    // Verify token
    const verificationToken = await verifyEmailVerificationToken(token, email);

    if (!verificationToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token.',
      });
    }

    // Update user's emailVerified status
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    // Mark token as used
    await markEmailVerificationTokenUsed(verificationToken.id);

    // Send welcome email
    await sendWelcomeEmail(email, verificationToken.user.name);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during email verification.',
    });
  }
}

/**
 * Login user
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Please verify your email before logging in.',
      });
    }

    // Generate access token
    const accessToken = generateAccessToken(user.id, user.email);

    // Extract session metadata
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = getClientIp(req);
    const deviceInfo = parseUserAgent(userAgent);
    const deviceName = generateDeviceName(deviceInfo.browser, deviceInfo.os, deviceInfo.deviceType);

    // Generate refresh token with session metadata
    const refreshToken = await createRefreshToken(user.id, {
      ipAddress,
      userAgent,
      deviceName,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
    });

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        accessToken,
        refreshToken, // Include refresh token in response for non-cookie clients
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
        },
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login.',
    });
  }
}

/**
 * Refresh access token
 */
async function refreshToken(req, res) {
  try {
    // Try to get refresh token from cookie first, then from body (for testing)
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found. Please provide refresh token in cookie or request body.',
      });
    }

    // Verify refresh token
    const tokenData = await verifyRefreshToken(refreshToken);

    if (!tokenData) {
      res.clearCookie('refreshToken');
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token.',
      });
    }

    // Update last used timestamp
    await updateRefreshTokenLastUsed(refreshToken);

    // Revoke old refresh token
    await revokeRefreshToken(refreshToken);

    // Generate new access token
    const accessToken = generateAccessToken(tokenData.user.id, tokenData.user.email);

    // Extract session metadata for new token
    const userAgent = req.headers['user-agent'] || '';
    const ipAddress = getClientIp(req);
    const deviceInfo = parseUserAgent(userAgent);
    const deviceName = generateDeviceName(deviceInfo.browser, deviceInfo.os, deviceInfo.deviceType);

    // Generate new refresh token (rotation) with session metadata
    const newRefreshToken = await createRefreshToken(tokenData.user.id, {
      ipAddress,
      userAgent,
      deviceName,
      deviceType: deviceInfo.deviceType,
      browser: deviceInfo.browser,
      os: deviceInfo.os,
    });

    // Set new refresh token in cookie
    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);

    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully.',
      data: {
        accessToken,
        refreshToken: newRefreshToken, // Also return in response for non-cookie clients
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during token refresh.',
    });
  }
}

/**
 * Logout user
 */
async function logout(req, res) {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (refreshToken) {
      // Get session info before revoking (for logging/tracking)
      const session = await getCurrentSession(refreshToken);

      if (session) {
        console.log(`User session logout: ${session.deviceName} at ${session.ipAddress}`);
      }

      // Revoke refresh token
      await revokeRefreshToken(refreshToken);
    }

    // Clear cookie
    res.clearCookie('refreshToken');

    res.status(200).json({
      success: true,
      message: 'Logout successful.',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during logout.',
    });
  }
}

/**
 * Request password reset
 */
async function requestPasswordReset(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    // Find user (prevent user enumeration by always returning success)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Generate password reset token
      const resetToken = await createPasswordResetToken(user.id, email);

      // Send password reset email
      await sendPasswordResetEmail(email, resetToken);
    }

    // Always return success to prevent user enumeration
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Request password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request.',
    });
  }
}

/**
 * Reset password
 */
async function resetPassword(req, res) {
  try {
    const { token, email, newPassword } = req.body;

    // Validate input
    if (!token || !email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token, email, and new password are required.',
      });
    }

    // Password strength validation
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long.',
      });
    }

    // Verify token
    const resetToken = await verifyPasswordResetToken(token, email);

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token.',
      });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Mark token as used
    await markPasswordResetTokenUsed(resetToken.id);

    // Revoke all refresh tokens (force logout everywhere)
    await revokeAllUserRefreshTokens(resetToken.userId);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during password reset.',
    });
  }
}

/**
 * Resend verification email
 */
async function resendVerificationEmail(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.',
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Prevent user enumeration - always return success
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an unverified account with that email exists, a verification email has been sent.',
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified.',
      });
    }

    // Check for recent verification token (rate limiting - prevent spam)
    const recentToken = await prisma.emailVerificationToken.findFirst({
      where: {
        userId: user.id,
        email: email,
        used: false,
        createdAt: {
          gte: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
        },
      },
    });

    if (recentToken) {
      return res.status(429).json({
        success: false,
        message: 'Please wait 2 minutes before requesting another verification email.',
      });
    }

    // Invalidate old unused tokens for this email
    await prisma.emailVerificationToken.updateMany({
      where: {
        userId: user.id,
        email: email,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generate new verification token
    const verificationToken = await createEmailVerificationToken(user.id, email);

    // Send verification email
    await sendVerificationEmail(email, verificationToken);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.',
    });
  } catch (error) {
    console.error('Resend verification email error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while sending verification email.',
    });
  }
}

module.exports = {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
};
