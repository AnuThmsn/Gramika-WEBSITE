const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { auth } = require('../middleware/auth');

// Add review (auth required)
router.post('/', auth, async (req, res) => {
  try {
    const { product, seller, rating, comment } = req.body;
    // require either product or seller
    if (!product && !seller) return res.status(400).json({ msg: 'product or seller required' });
    const review = new Review({ user: req.user._id, product: product || null, seller: seller || null, rating, comment });
    await review.save();
    res.json(review);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get reviews for product
router.get('/product/:productId', async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId }).populate('user', 'name email');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// Get reviews for seller
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const reviews = await Review.find({ seller: req.params.sellerId }).populate('user', 'name email');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;