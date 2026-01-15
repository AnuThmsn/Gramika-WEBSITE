const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { auth, admin } = require('../middleware/auth');

// GET /api/products
router.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    const filter = {};
    if (q) filter.name = { $regex: q, $options: 'i' };
    const products = await Product.find({
  ...filter,
  status: 'Active',
  quantity: { $gt: 0 }
}).limit(200);

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// GET /api/products/:id
router.get('/:id', async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ msg: 'Not found' });
    res.json(p);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Admin: create product
router.post('/', auth, admin, async (req, res) => {
  try {
    const p = new Product(req.body);
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Seller: create a product (authenticated sellers)
router.post('/seller', auth, async (req, res) => {
  try {
    // req.user will be set by auth middleware
    const payload = { ...req.body, seller: req.user._id };
    const p = new Product(payload);
    await p.save();
    res.json(p);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Update product: allow admin or the seller who owns the product
router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) return res.status(404).json({ msg: 'Not found' });
    // allow if admin or owner
    if (!req.user.isAdmin && String(existing.seller) !== String(req.user._id)) {
      return res.status(403).json({ msg: 'Forbidden' });
    }
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(p);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Admin: delete product
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
