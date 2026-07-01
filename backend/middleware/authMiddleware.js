// const jwt = require('jsonwebtoken');
// const User = require('../models/User');
 
// exports.protect = async (req, res, next) => {
//   try {
//     let token;
//     if (req.headers.authorization?.startsWith('Bearer ')) {
//       token = req.headers.authorization.split(' ')[1];
//     }
//     if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
 
//     const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret123');
//     req.user = await User.findById(decoded.id).select('-password');
//     if (!req.user) return res.status(401).json({ message: 'User not found' });
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Token invalid or expired' });
//   }
// };
 
// exports.admin = (req, res, next) => {
//   if (req.user?.role === 'admin') return next();
//   res.status(403).json({ message: 'Admin access required' });
// };
 

const jwt = require('jsonwebtoken');
const User = require('../models/User');
 
const SECRET = process.env.JWT_SECRET || 'nexusshop_secret_key_2025';
 
const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({ message: 'Not authorized - no token' });
    }
    const decoded = jwt.verify(token, SECRET);
    req.user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!req.user) {
      return res.status(401).json({ message: 'User account not found' });
    }
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token invalid or expired - please login again' });
  }
};
 
const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};
 
module.exports = { protect, admin };
 