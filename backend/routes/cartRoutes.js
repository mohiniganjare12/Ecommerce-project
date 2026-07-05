const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Cart    = require('../models/Cart');
const Product = require('../models/Product');

const POPULATE = 'name price images stock';

// ── Get cart ──────────────────────────────────────────────────
router.get('/', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate('items.product', POPULATE);
    res.json(cart || { items: [] });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Add to cart ───────────────────────────────────────────────
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < quantity) return res.status(400).json({ message: 'Insufficient stock' });

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) cart = new Cart({ user: req.user._id, items: [] });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);
    if (idx >= 0) cart.items[idx].quantity += quantity;
    else cart.items.push({ product: productId, quantity, price: product.price });

    await cart.save();
    // Always return populated cart so frontend has full product details
    const populated = await Cart.findById(cart._id).populate('items.product', POPULATE);
    res.json(populated);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Update quantity ───────────────────────────────────────────
router.put('/update', protect, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.product.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.product.toString() !== productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product', POPULATE);
    res.json(populated);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Remove item ───────────────────────────────────────────────
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      i => i.product.toString() !== req.params.productId
    );

    await cart.save();
    const populated = await Cart.findById(cart._id).populate('items.product', POPULATE);
    res.json(populated);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// ── Clear cart ────────────────────────────────────────────────
router.delete('/clear', protect, async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ user: req.user._id }, { $set: { items: [] } });
    res.json({ items: [] });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;