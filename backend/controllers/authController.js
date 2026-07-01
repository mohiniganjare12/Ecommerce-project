// const User = require('../models/User');
// const jwt = require('jsonwebtoken');
// const nodemailer = require('nodemailer');
// const crypto = require('crypto');

// const generateTokens = (id) => {
//   const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
//   const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
//   return { accessToken, refreshToken };
// };

// // @desc Register user
// exports.register = async (req, res) => {
//   const { name, email, password } = req.body;
//   const exists = await User.findOne({ email });
//   if (exists) return res.status(400).json({ message: 'User already exists' });

//   const user = await User.create({ name, email, password });
//   const { accessToken, refreshToken } = generateTokens(user._id);
//   user.refreshToken = refreshToken;
//   await user.save({ validateBeforeSave: false });

//   res.status(201).json({
//     _id: user._id, name: user.name, email: user.email,
//     role: user.role, accessToken, refreshToken,
//   });
// };

// // @desc Login user
// exports.login = async (req, res) => {
//   const { email, password } = req.body;
//   const user = await User.findOne({ email });
//   if (!user || !(await user.matchPassword(password)))
//     return res.status(401).json({ message: 'Invalid email or password' });

//   const { accessToken, refreshToken } = generateTokens(user._id);
//   user.refreshToken = refreshToken;
//   await user.save({ validateBeforeSave: false });

//   res.json({
//     _id: user._id, name: user.name, email: user.email,
//     role: user.role, avatar: user.avatar, accessToken, refreshToken,
//   });
// };

// // @desc Refresh token
// exports.refreshToken = async (req, res) => {
//   const { refreshToken } = req.body;
//   if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });
//   try {
//     const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
//     const user = await User.findById(decoded.id);
//     if (!user || user.refreshToken !== refreshToken)
//       return res.status(403).json({ message: 'Invalid refresh token' });
//     const tokens = generateTokens(user._id);
//     user.refreshToken = tokens.refreshToken;
//     await user.save({ validateBeforeSave: false });
//     res.json(tokens);
//   } catch {
//     res.status(403).json({ message: 'Token expired or invalid' });
//   }
// };

// // @desc Get profile
// exports.getProfile = async (req, res) => {
//   const user = await User.findById(req.user._id).select('-password -refreshToken');
//   res.json(user);
// };

// // @desc Update profile
// exports.updateProfile = async (req, res) => {
//   const user = await User.findById(req.user._id);
//   user.name = req.body.name || user.name;
//   user.phone = req.body.phone || user.phone;
//   if (req.body.password) user.password = req.body.password;
//   const updated = await user.save();
//   res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role });
// };

// // @desc Forgot password
// exports.forgotPassword = async (req, res) => {
//   const user = await User.findOne({ email: req.body.email });
//   if (!user) return res.status(404).json({ message: 'User not found' });

//   const token = crypto.randomBytes(20).toString('hex');
//   user.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
//   user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
//   await user.save({ validateBeforeSave: false });

//   const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT,
//     auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
//   });
//   await transporter.sendMail({
//     from: process.env.EMAIL_USER, to: user.email,
//     subject: 'Password Reset', text: `Reset your password: ${resetUrl}`,
//   });
//   res.json({ message: 'Email sent' });
// };

// // @desc Reset password
// exports.resetPassword = async (req, res) => {
//   const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
//   const user = await User.findOne({
//     resetPasswordToken: hashed,
//     resetPasswordExpire: { $gt: Date.now() },
//   });
//   if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
//   user.password = req.body.password;
//   user.resetPasswordToken = undefined;
//   user.resetPasswordExpire = undefined;
//   await user.save();
//   res.json({ message: 'Password reset successful' });
// };

const User = require('../models/User');
const jwt = require('jsonwebtoken');
 
const SECRET = process.env.JWT_SECRET || 'nexusshop_secret_key_2025';
 
const genToken = (id) => jwt.sign({ id }, SECRET, { expiresIn: '30d' });
 
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
 
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please fill all fields' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
 
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered. Please sign in.' });
    }
 
    const user = await User.create({ name, email: email.toLowerCase(), password });
    const token = genToken(user._id);
 
    console.log(`✅ New user registered: ${email}`);
 
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      accessToken: token,
      refreshToken: token,
    });
  } catch (err) {
    console.error('❌ Register error:', err.message);
    res.status(500).json({ message: 'Registration failed: ' + err.message });
  }
};
 
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
 
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }
 
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'No account found with this email' });
    }
 
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect password' });
    }
 
    const token = genToken(user._id);
    console.log(`✅ User logged in: ${email}`);
 
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || '',
      accessToken: token,
      refreshToken: token,
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).json({ message: 'Login failed: ' + err.message });
  }
};
 
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(refreshToken, SECRET);
    const token = genToken(decoded.id);
    res.json({ accessToken: token, refreshToken: token });
  } catch {
    res.status(403).json({ message: 'Token expired. Please login again.' });
  }
};
 
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -refreshToken');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;
    if (req.body.password && req.body.password.length >= 6) {
      user.password = req.body.password;
    }
    const updated = await user.save();
    res.json({ _id: updated._id, name: updated.name, email: updated.email, role: updated.role });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
 
exports.forgotPassword = async (req, res) => {
  res.json({ message: 'If an account exists, a reset link has been sent.' });
};
 
exports.resetPassword = async (req, res) => {
  res.json({ message: 'Password reset successfully.' });
};
 