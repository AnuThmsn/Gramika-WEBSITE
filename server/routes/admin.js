const express = require('express');
const router = express.Router();
const { auth, admin } = require('../middleware/auth');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// GET /api/admin/stats
router.get('/stats', auth, admin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenueAgg = await Order.aggregate([
      { $group: { _id: null, revenue: { $sum: { $ifNull: ['$total', 0] } } } }
    ]);
    const totalRevenue = (totalRevenueAgg[0] && totalRevenueAgg[0].revenue) || 0;

    const userCount = await User.countDocuments();
    const sellerCount = await User.countDocuments({ isSeller: true });
    const buyerCount = userCount - sellerCount;
    const productCount = await Product.countDocuments();

    // monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const monthly = await Order.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        revenue: { $sum: { $ifNull: ['$total', 0] } },
        orders: { $sum: 1 }
      } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // format monthly results into labels for last 6 months
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1, label: d.toLocaleString('default', { month: 'short' }) });
    }
    const monthlyData = months.map(m => {
      const found = monthly.find(x => x._id.year === m.year && x._id.month === m.month);
      return { label: m.label, revenue: found ? found.revenue : 0, orders: found ? found.orders : 0 };
    });

    // simple profit estimate: no commission, profit = revenue
    const monthlyProfit = monthlyData.map(m => ({ label: m.label, profit: m.revenue }));

    res.json({ totalOrders, totalRevenue, userCount, sellerCount, buyerCount, productCount, monthly: monthlyData, monthlyProfit });
  } catch (err) {
    console.error('admin stats error', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
