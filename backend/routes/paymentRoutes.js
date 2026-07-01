const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createPaymentIntent, stripeWebhook } = require('../controllers/paymentController');

router.post('/create-intent', protect, createPaymentIntent);
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;
