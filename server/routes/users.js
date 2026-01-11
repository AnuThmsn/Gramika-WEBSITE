const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

// Admin check middleware
const adminCheck = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.isAdmin) return res.status(403).json({ msg: 'Admin access required' });
    next();
  } catch (err) {
    return res.status(500).json({ msg: 'Server error' });
  }
};

// Get current logged-in user
router.get('/me', auth, async (req, res) => {
  res.json(req.user);
});

// Update profile
router.put('/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Change password
router.put('/me/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ msg: 'Current password and new password are required' });
    }
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Current password is incorrect' });
    }
    const hash = await bcrypt.hash(newPassword, 10);
    user.password = hash;
    await user.save();
    res.json({ msg: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Delete account
router.delete('/me', auth, async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ msg: 'Password is required to delete account' });
    }
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Password is incorrect' });
    }
    await User.findByIdAndDelete(req.user._id);
    res.json({ msg: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Public: list sellers (users with isSeller true or seller.status != 'not_seller')
router.get('/sellers', async (req, res) => {
  try {
    const sellers = await User.find({ $or: [{ isSeller: true }, { 'seller.status': { $ne: 'not_seller' } }] }).select('name email seller');
    res.json(sellers);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get all users (admin only)
router.get('/admin', auth, adminCheck, async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    // For each user, check if seller exists
    const usersWithSeller = await Promise.all(users.map(async (user) => {
      const seller = await Seller.findOne({ user: user._id });
      return { ...user.toObject(), seller };
    }));
    res.json(usersWithSeller);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Create or update seller
router.post('/seller', auth, async (req, res) => {
  try {
    const sellerData = req.body;
    sellerData.user = req.user._id;
    const seller = await Seller.findOneAndUpdate(
      { user: req.user._id },
      sellerData,
      { new: true, upsert: true }
    );
    await User.findByIdAndUpdate(req.user._id, { isSeller: true });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get my seller
router.get('/seller/me', auth, async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update my seller
router.put('/seller/me', auth, async (req, res) => {
  try {
    const updates = req.body;
    const seller = await Seller.findOneAndUpdate({ user: req.user._id }, updates, { new: true, upsert: true });
    res.json(seller);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get seller stats
router.get('/seller/stats', auth, async (req, res) => {
  try {
    const sellerId = req.user._id;

    // Total products
    const totalProducts = await Product.countDocuments({ seller: sellerId });

    // Total sales (sum of order totals where products belong to seller)
    // This is complex, need to aggregate orders with products
    const orders = await Order.find({}).populate('items.product');
    let totalSales = 0;
    let pendingOrders = 0;
    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.product && item.product.seller.toString() === sellerId.toString()) {
          totalSales += item.price * item.quantity;
          if (order.status !== 'delivered') pendingOrders++;
        }
      });
    });

    // Monthly sales for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthly = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $unwind: '$items' },
      { $lookup: { from: 'products', localField: 'items.product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $match: { 'product.seller': sellerId } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        sales: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
      } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Format monthly results
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short' }) });
    }
    const monthlyData = months.map(m => {
      const found = monthly.find(x => x._id.year === m.year && x._id.month === m.month);
      return { label: m.label, sales: found ? found.sales : 0 };
    });

    res.json({
      totalProducts,
      totalSales,
      pendingOrders,
      monthlyData
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update seller by ID (admin)
router.put('/seller/:id', auth, adminCheck, async (req, res) => {
  try {
    const updates = req.body;
    const seller = await Seller.findOneAndUpdate({ user: req.params.id }, updates, { new: true });
    if (!seller) return res.status(404).json({ msg: 'Seller not found' });
    // If status is verified, set user.isSeller = true
    if (updates.status === 'verified') {
      await User.findByIdAndUpdate(req.params.id, { isSeller: true });
    }
    res.json(seller);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get user by ID (admin only)
router.get('/:id', auth, adminCheck, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email phone address isAdmin createdAt updatedAt');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    const seller = await Seller.findOne({ user: req.params.id });
    res.json({ ...user.toObject(), seller });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;