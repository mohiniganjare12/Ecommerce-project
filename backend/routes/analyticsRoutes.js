const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const { getDashboardStats, getRevenueChart, getTopProducts, getOrdersByStatus } = require('../controllers/analyticsController');

router.get('/dashboard', protect, admin, getDashboardStats);
router.get('/revenue', protect, admin, getRevenueChart);
router.get('/top-products', protect, admin, getTopProducts);
router.get('/orders-status', protect, admin, getOrdersByStatus);

module.exports = router;
