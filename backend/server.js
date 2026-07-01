const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// ── Security headers ──────────────────────────────────────────
// Sets ~15 protective HTTP headers (XSS protection, no-sniff, etc.)
app.use(helmet());

// ── CORS — only allow your actual frontend(s), not the whole internet ──
// Add every origin you actually use (local dev + deployed frontend URL).
const allowedOrigins = [
  'http://localhost:3000',                 // local React dev server
  process.env.FRONTEND_URL,                // deployed frontend (set this in .env)
].filter(Boolean); // removes undefined if FRONTEND_URL isn't set yet

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Rate limiting ──────────────────────────────────────────────
// General limiter for all API routes — prevents abuse/scraping
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,                 // limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
});
app.use('/api', generalLimiter);

// Stricter limiter just for auth routes — prevents brute-force login/signup attacks
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                  // only 20 auth attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many auth attempts, please try again later.' },
});
app.use('/api/auth', authLimiter);

// ── Routes ────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend is running!' });
});

// ── Error handler ─────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.statusCode || 500).json({ message: err.message });
});

// ── Connect DB & start server ───────────────────────────────────
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/nexusshop')
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`   Open: http://localhost:${PORT}/api/health`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Error:', err.message);
    process.exit(1);
  });
