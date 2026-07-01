const express = require('express');
const router  = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderToPaid,
  updateOrderToDelivered,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  deleteOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');
 
// User routes
router.post('/',           protect, createOrder);
router.get('/mine',        protect, getMyOrders);
router.get('/:id',         protect, getOrderById);
router.put('/:id/pay',     protect, updateOrderToPaid);
router.put('/:id/cancel',  protect, cancelOrder);
 
// Admin routes
router.get('/',             protect, admin, getAllOrders);
router.put('/:id/deliver',  protect, admin, updateOrderToDelivered);
router.put('/:id/status',   protect, admin, updateOrderStatus);
router.delete('/:id',       protect, admin, deleteOrder);
 
module.exports = router;
 