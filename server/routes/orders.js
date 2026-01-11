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

// Get orders for seller (orders that contain products sold by this seller)
router.get('/seller', auth, orderController.getSellerOrders);

// Get all orders (admin only)
router.get('/admin', auth, adminCheck, orderController.getAllOrders);

module.exports = router;
