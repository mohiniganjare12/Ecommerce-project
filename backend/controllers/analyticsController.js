const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const [
    totalRevenue, monthRevenue, lastMonthRevenue,
    totalOrders, monthOrders,
    totalUsers, monthUsers,
    totalProducts, lowStockProducts,
  ] = await Promise.all([
    Order.aggregate([{ $match: { isPaid: true } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.aggregate([{ $match: { isPaid: true, createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.aggregate([{ $match: { isPaid: true, createdAt: { $gte: startOfLastMonth, $lt: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ stock: { $lte: 5 } }),
  ]);

  res.json({
    totalRevenue: totalRevenue[0]?.total || 0,
    monthRevenue: monthRevenue[0]?.total || 0,
    lastMonthRevenue: lastMonthRevenue[0]?.total || 0,
    totalOrders, monthOrders,
    totalUsers, monthUsers,
    totalProducts, lowStockProducts,
  });
};

// @desc Revenue chart (last 12 months)
exports.getRevenueChart = async (req, res) => {
  const data = await Order.aggregate([
    { $match: { isPaid: true } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    { $limit: 12 },
  ]);
  res.json(data);
};

// @desc Top selling products
exports.getTopProducts = async (req, res) => {
  const products = await Product.find().sort({ sold: -1 }).limit(10).select('name sold price images rating');
  res.json(products);
};

// @desc Orders by status
exports.getOrdersByStatus = async (req, res) => {
  const data = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ]);
  res.json(data);
};
