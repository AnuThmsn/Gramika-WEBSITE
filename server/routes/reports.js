const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { auth } = require('../middleware/auth');

// Add report (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { product, reason } = req.body;
    const report = new Report({ user: req.user._id, product, reason });
    await report.save();
    res.json(report);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get reports for admin
router.get('/', auth, async (req, res) => {
  try {
    // check if admin
    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (!user.isAdmin) return res.status(403).json({ msg: 'Admin only' });
    const reports = await Report.find().populate('user', 'name email').populate('product', 'name');
    res.json(reports);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;