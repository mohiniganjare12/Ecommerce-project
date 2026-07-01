const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  orderItems: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    image: String,
    price: Number,
    quantity: { type: Number, required: true, min: 1 },
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zip: String,
    country: String,
  },
  paymentMethod: { type: String, default: 'stripe' },
  paymentResult: {
    id: String,
    status: String,
    update_time: String,
    email_address: String,
  },
  itemsPrice: { type: Number, required: true },
  shippingPrice: { type: Number, default: 0 },
  taxPrice: { type: Number, default: 0 },
  totalPrice: { type: Number, required: true },
  isPaid: { type: Boolean, default: false },
  paidAt: Date,
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
  }],
  trackingNumber: String,
  deliveredAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
