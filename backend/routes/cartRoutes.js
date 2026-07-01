const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart
router.get('/', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product', 'name price images stock');
  res.json(cart || { items: [] });
});

// Add to cart
router.post('/add', protect, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const itemIndex = cart.items.findIndex(i => i.product.toString() === productId);
  if (itemIndex >= 0) cart.items[itemIndex].quantity += quantity;
  else cart.items.push({ product: productId, quantity, price: product.price });

  await cart.save();
  res.json(cart);
});

// Update quantity
router.put('/update', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  const item = cart.items.find(i => i.product.toString() === productId);
  if (!item) return res.status(404).json({ message: 'Item not in cart' });
  if (quantity <= 0) cart.items = cart.items.filter(i => i.product.toString() !== productId);
  else item.quantity = quantity;
  await cart.save();
  res.json(cart);
});

// Remove item
router.delete('/remove/:productId', protect, async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);
  await cart.save();
  res.json(cart);
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });
  res.json({ message: 'Cart cleared' });
});

module.exports = router;
