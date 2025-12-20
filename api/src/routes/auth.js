const express = require('express');
const {
  register,
  verifyEmail,
  login,
  refreshToken,
  logout,
  requestPasswordReset,
  resetPassword,
  resendVerificationEmail,
} = require('../controllers/authController');

const router = express.Router();

// Register new user
router.post('/register', register);

// Verify email
router.get('/verify-email', verifyEmail);

// Resend verification email
router.post('/resend-verification-email', resendVerificationEmail);

// Login
router.post('/login', login);

// Refresh access token
router.post('/refresh-token', refreshToken);

// Logout
router.post('/logout', logout);

// Request password reset
router.post('/request-password-reset', requestPasswordReset);

// Reset password
router.post('/reset-password', resetPassword);

module.exports = router;
