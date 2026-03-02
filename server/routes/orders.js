const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const orderController = require('../controllers/orderController');

// middleware: require auth (keep existing implementation)
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = data.id;
    req.user = { _id: data.id };
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

// Admin check middleware
const adminCheck = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) return res.status(403).json({ msg: 'Admin access required' });
    next();
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Create order
router.post('/', auth, orderController.createOrder);

// Get user's orders
router.get('/', auth, orderController.getUserOrders);

// Get all orders (admin only)
router.get('/admin', auth, adminCheck, orderController.getAllOrders);

// Get orders for seller (orders that contain products sold by this seller)
router.get('/seller', auth, orderController.getSellerOrders);

// Update order status (seller can update orders with their products)
router.put('/:id/status', auth, orderController.updateOrderStatus);

// User report order as not reached
router.put('/:id/report', auth, orderController.reportOrderNotReached);

// Admin flag sellers of an order
router.put('/:id/flag-seller', auth, adminCheck, orderController.flagOrderSeller);

// Admin update order status (admin can update any order)
router.put('/:id/status/admin', auth, adminCheck, async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ msg: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Find and update order (admin can update any order)
    const updatedOrder = await require('../models/Order').findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('items.product').populate('user', 'name email');

    if (!updatedOrder) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    return res.json(updatedOrder);
  } catch (err) {
    console.error('Admin order status update error:', err);
    return res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
