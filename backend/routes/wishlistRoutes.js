const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Wishlist = require('../models/Wishlist');

router.get('/', protect, async (req, res) => {
  const wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products', 'name price images rating');
  res.json(wishlist || { products: [] });
});

router.post('/toggle/:productId', protect, async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id });
  if (!wishlist) wishlist = new Wishlist({ user: req.user._id, products: [] });
  const index = wishlist.products.indexOf(req.params.productId);
  if (index >= 0) wishlist.products.splice(index, 1);
  else wishlist.products.push(req.params.productId);
  await wishlist.save();
  res.json(wishlist);
});

module.exports = router;
