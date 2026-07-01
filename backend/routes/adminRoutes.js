const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');

router.get('/users', protect, admin, async (req, res) => {
  const users = await User.find({}).select('-password -refreshToken').sort({ createdAt: -1 });
  res.json(users);
});

router.get('/users/:id', protect, admin, async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

router.put('/users/:id', protect, admin, async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { role: req.body.role }, { new: true }).select('-password');
  res.json(user);
});

router.delete('/users/:id', protect, admin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;
