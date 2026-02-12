const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const mongoose = require('mongoose');

// Multer memory storage for vendor document uploads (PDF only)
const upload = multer({ storage: multer.memoryStorage(), fileFilter: (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Only PDF files are allowed'), false);
} });

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
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    const userObj = req.user.toObject();
    userObj.seller = seller || null;
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
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
    let sellerData = req.body;
    sellerData.user = req.user._id;
    
    // Map shopName → name for backward compatibility
    if (sellerData.shopName && !sellerData.name) {
      sellerData.name = sellerData.shopName;
      delete sellerData.shopName;
    }
    
    // Auto-populate businessEmail from user email if not provided
    if (!sellerData.businessEmail && req.user.email) {
      sellerData.businessEmail = req.user.email;
    }
    
    const seller = await Seller.findOneAndUpdate(
      { user: req.user._id },
      sellerData,
      { new: true, upsert: true }
    );
    // Do not set isSeller here, only when approved
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

// Alias: support frontend calling /me/seller (some client code uses this path)
router.get('/me/seller', auth, async (req, res) => {
  try {
    const seller = await Seller.findOne({ user: req.user._id });
    const userObj = req.user.toObject();
    userObj.seller = seller || null;
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update my seller (original path)
router.put('/seller/me', auth, async (req, res) => {
  try {
    let updates = req.body || {};
    // support nested { seller: { ... } } shape from frontend
    let sellerUpdates = updates.seller ? updates.seller : updates;
    
    // Map shopName → name for backward compatibility
    if (sellerUpdates.shopName && !sellerUpdates.name) {
      sellerUpdates.name = sellerUpdates.shopName;
      delete sellerUpdates.shopName;
    }
    
    // Auto-populate businessEmail from user email if not provided
    if (!sellerUpdates.businessEmail && req.user.email) {
      sellerUpdates.businessEmail = req.user.email;
    }
    
    const seller = await Seller.findOneAndUpdate({ user: req.user._id }, sellerUpdates, { new: true, upsert: true });
    // if client asked to set isSeller on user, honor it
    if (updates.isSeller) {
      await require('../models/User').findByIdAndUpdate(req.user._id, { isSeller: true });
    }
    // return merged user + seller
    const userObj = req.user.toObject();
    userObj.seller = seller;
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Alias: accept PUT at /me/seller for clients that use that URL
router.put('/me/seller', auth, async (req, res) => {
  try {
    let updates = req.body || {};
    let sellerUpdates = updates.seller ? updates.seller : updates;
    
    // Map shopName → name for backward compatibility
    if (sellerUpdates.shopName && !sellerUpdates.name) {
      sellerUpdates.name = sellerUpdates.shopName;
      delete sellerUpdates.shopName;
    }
    
    // Auto-populate businessEmail from user email if not provided
    if (!sellerUpdates.businessEmail && req.user.email) {
      sellerUpdates.businessEmail = req.user.email;
    }
    
    const seller = await Seller.findOneAndUpdate({ user: req.user._id }, sellerUpdates, { new: true, upsert: true });
    if (updates.isSeller) {
      await require('../models/User').findByIdAndUpdate(req.user._id, { isSeller: true });
    }
    const userObj = req.user.toObject();
    userObj.seller = seller;
    res.json(userObj);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Upload Aadhar PDF for current user (stores in GridFS and updates Seller)
router.post('/me/seller/aadhar', auth, upload.single('aadhar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded or invalid file type (PDF only)' });
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const filename = `${req.user._id}_aadhar_${Date.now()}_${req.file.originalname}`;
    const uploadStream = bucket.openUploadStream(filename, { contentType: req.file.mimetype });
    uploadStream.end(req.file.buffer);
    uploadStream.on('finish', async (file) => {
      // update Seller doc
      const seller = await Seller.findOneAndUpdate(
        { user: req.user._id },
        { aadharFileName: file.filename, aadharFileId: file._id.toString() },
        { new: true, upsert: true }
      );
      return res.json({ fileName: file.filename, fileId: file._id.toString(), seller });
    });
    uploadStream.on('error', (err) => res.status(500).json({ error: err.message }));
  } catch (err) {
    console.error('Aadhar upload error:', err);
    res.status(500).json({ msg: err.message });
  }
});

// Upload License PDF for current user (stores in GridFS and updates Seller)
router.post('/me/seller/license', auth, upload.single('license'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ msg: 'No file uploaded or invalid file type (PDF only)' });
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
    const filename = `${req.user._id}_license_${Date.now()}_${req.file.originalname}`;
    const uploadStream = bucket.openUploadStream(filename, { contentType: req.file.mimetype });
    uploadStream.end(req.file.buffer);
    uploadStream.on('finish', async (file) => {
      // update Seller doc
      const seller = await Seller.findOneAndUpdate(
        { user: req.user._id },
        { licenseFileName: file.filename, licenseFileId: file._id.toString() },
        { new: true, upsert: true }
      );
      return res.json({ fileName: file.filename, fileId: file._id.toString(), seller });
    });
    uploadStream.on('error', (err) => res.status(500).json({ error: err.message }));
  } catch (err) {
    console.error('License upload error:', err);
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
    const seller = await Seller.findOneAndUpdate({ user: new mongoose.Types.ObjectId(req.params.id) }, updates, { new: true });
    if (!seller) return res.status(404).json({ msg: 'Seller not found' });
    // If status is verified, set user.isSeller = true, otherwise set to false
    if (updates.status === 'verified') {
      await User.findByIdAndUpdate(req.params.id, { isSeller: true });
    } else {
      await User.findByIdAndUpdate(req.params.id, { isSeller: false });
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
    const seller = await Seller.findOne({ user: new mongoose.Types.ObjectId(req.params.id) });
    res.json({ ...user.toObject(), seller });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;