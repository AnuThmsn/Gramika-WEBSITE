const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

// Get user's cart
router.get('/', auth, cartController.getCart);

// Add/update item
router.post('/item', auth, cartController.addOrUpdateItem);

// Remove item
router.delete('/item/:productId', auth, cartController.removeItem);

// Clear cart
router.delete('/', auth, cartController.clearCart);

module.exports = router;