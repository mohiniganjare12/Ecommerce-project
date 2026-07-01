const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  verifiedPurchase: { type: Boolean, default: false },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  comparePrice: { type: Number },
  category: { type: String, required: true },
  subCategory: { type: String },
  brand: { type: String },
  images: [{ url: String, public_id: String }],
  stock: { type: Number, required: true, default: 0 },
  sold: { type: Number, default: 0 },
  reviews: [reviewSchema],
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  specifications: [{ key: String, value: String }],
}, { timestamps: true });

// Text index for search
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);
