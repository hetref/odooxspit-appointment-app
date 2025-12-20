const express = require('express');
const { createOrder, handleWebhook } = require('../controllers/paymentController');
const requireAuth = require('../middlewares/requireAuth');

const router = express.Router();

// Create Razorpay order for a booking (authenticated user)
router.post('/payments/create-order', requireAuth, createOrder);

// Razorpay webhooks for all connected merchants
router.post('/webhooks/razorpay', handleWebhook);

module.exports = router;
