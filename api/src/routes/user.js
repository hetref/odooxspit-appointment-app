const express = require('express');
const requireAuth = require('../middlewares/requireAuth');
const {
  getProfile,
  updateProfile,
  deleteAccount,
} = require('../controllers/userController');

const router = express.Router();

// All user routes require authentication
router.use(requireAuth);

// Get current user profile
router.get('/me', getProfile);

// Update user profile
router.put('/update', updateProfile);

// Delete user account
router.delete('/delete', deleteAccount);

module.exports = router;
