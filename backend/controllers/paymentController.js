const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

// @desc Create payment intent
exports.createPaymentIntent = async (req, res) => {
  const { amount, currency = 'usd' } = req.body;
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    metadata: { userId: req.user._id.toString() },
  });
  res.json({ clientSecret: paymentIntent.client_secret });
};

// @desc Stripe webhook
exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    console.log('Payment succeeded:', paymentIntent.id);
  }
  res.json({ received: true });
};
