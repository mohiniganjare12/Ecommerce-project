const Order   = require('../models/Order');
const Product = require('../models/Product');
const Cart    = require('../models/Cart');

// @desc  Create new order
// @route POST /api/orders
exports.createOrder = async (req, res) => {
  try {
    const {
      orderItems, shippingAddress, paymentMethod,
      itemsPrice, shippingPrice, taxPrice, totalPrice,
      isPaid, paidAt,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    const enriched = [];
    for (const item of orderItems) {
      const productId = item.product?._id || item.product;

      if (!productId) {
        return res.status(400).json({ message: 'Invalid product in order items' });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${productId}` });
      }

      enriched.push({
        product:  product._id,
        name:     item.name     || product.name,
        image:    item.image    || product.images?.[0]?.url || '',
        price:    item.price    || product.price,
        quantity: item.quantity || 1,
      });

      product.stock = Math.max(0, (product.stock || 0) - (item.quantity || 1));
      product.sold  = (product.sold  || 0) + (item.quantity || 1);
      await product.save();
    }

    const order = await Order.create({
      user:            req.user._id,
      orderItems:      enriched,
      shippingAddress: shippingAddress || {},
      paymentMethod:   paymentMethod   || 'card',
      itemsPrice:      Number(itemsPrice)    || 0,
      shippingPrice:   Number(shippingPrice) || 0,
      taxPrice:        Number(taxPrice)      || 0,
      totalPrice:      Number(totalPrice)    || 0,
      isPaid:          Boolean(isPaid),
      paidAt:          isPaid ? (paidAt || new Date()) : null,
      status:          isPaid ? 'processing' : 'pending',
    });

    // Clear user's cart
    try {
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [], totalPrice: 0 } }
      );
    } catch (_) {}

    console.log(`✅ Order created: ${order._id} | User: ${req.user.email} | Total: $${totalPrice}`);

    res.status(201).json(order);

  } catch (err) {
    console.error('❌ createOrder error:', err.message);
    res.status(500).json({ message: 'Failed to create order: ' + err.message });
  }
};

// @desc  Get my orders
// @route GET /api/orders/mine
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('orderItems.product', 'name images price');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get order by ID
// @route GET /api/orders/:id
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('orderItems.product', 'name images price category');

    if (!order) return res.status(404).json({ message: 'Order not found' });

    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Pay order
// @route PUT /api/orders/:id/pay
exports.updateOrderToPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.isPaid  = true;
    order.paidAt  = new Date();
    order.status  = 'processing';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Deliver order (admin)
// @route PUT /api/orders/:id/deliver
exports.updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.isDelivered = true;
    order.deliveredAt = new Date();
    order.status      = 'delivered';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Update status (admin)
// @route PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (req.body.status)         order.status         = req.body.status;
    if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
    if (req.body.status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = new Date();
    }
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Cancel order
// @route PUT /api/orders/:id/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (['shipped','delivered'].includes(order.status)) {
      return res.status(400).json({ message: 'Cannot cancel a shipped order' });
    }
    for (const item of order.orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity }
      });
    }
    order.status = 'cancelled';
    await order.save();
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  All orders (admin)
// @route GET /api/orders/admin
exports.getAllOrders = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip  = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('user','name email'),
      Order.countDocuments(filter),
    ]);
    res.json({ orders, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete order (admin)
// @route DELETE /api/orders/:id
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    await order.deleteOne();
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
