const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get user's cart, populating all product details
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      model: 'Product',
      select: 'name price quantity imageUrl imageGridFsId'
    });
    if (!cart) {
      return res.json({ items: [] });
    }
    return res.json(cart);
  } catch (err) {
    console.error('cartController.getCart:', err);
    return res.status(500).json({ msg: 'Server error while fetching cart.' });
  }
};

/**
 * Adds an item to the cart or updates its quantity.
 * This function MUST NOT modify the Product collection (i.e., product stock).
 * It only interacts with the Cart collection.
 */
exports.addOrUpdateItem = async (req, res) => {
  try {
    const { product: productId, qty } = req.body;
    const quantity = Number(qty || 1);

    if (!productId) {
      return res.status(400).json({ msg: 'Request must include a product ID.' });
    }

    // 1. Fetch the authoritative product info (price and stock)
    const product = await Product.findById(productId).select('quantity price name');
    if (!product) {
      return res.status(404).json({ msg: 'Product not found.' });
    }

    // 2. Check if product is sold out (but DO NOT modify stock)
    if (product.quantity <= 0) {
      return res.status(400).json({ msg: 'This product is currently sold out.' });
    }
    
    // 3. Find the user's cart or create a new one
    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // 4. Check if the item is already in the cart
    const existingItemIndex = cart.items.findIndex(i => String(i.product) === String(productId));

    if (existingItemIndex > -1) {
      // If item exists, update its quantity
      cart.items[existingItemIndex].qty = quantity;
      // Always update with the latest price from the Product model
      cart.items[existingItemIndex].priceAt = product.price;
    } else {
      // If item doesn't exist, add it to the cart
      cart.items.push({
        product: productId,
        qty: quantity,
        priceAt: product.price // Use authoritative price
      });
    }

    // 5. Save the updated cart
    cart.updatedAt = new Date();
    await cart.save();

    // 6. Return the updated cart, populated with product details
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      model: 'Product',
      select: 'name price quantity imageUrl imageGridFsId'
    });

    return res.status(200).json(populatedCart);

  } catch (err) {
    console.error('cartController.addOrUpdateItem:', err);
    return res.status(500).json({ msg: 'Server error while adding item to cart.' });
  }
};

// Removes an item from the cart
exports.removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ msg: 'Cart not found.' });
    }

    cart.items = cart.items.filter(i => String(i.product) !== String(productId));
    cart.updatedAt = new Date();
    await cart.save();

    return res.json(cart);
  } catch (err) {
    console.error('cartController.removeItem:', err);
    return res.status(500).json({ msg: 'Server error while removing item.' });
  }
};

// Clears all items from the user's cart
exports.clearCart = async (req, res) => {
  try {
    await Cart.deleteOne({ user: req.user._id });
    return res.status(200).json({ msg: 'Cart cleared successfully.' });
  } catch (err) {
    console.error('cartController.clearCart:', err);
    return res.status(500).json({ msg: 'Server error while clearing cart.' });
  }
};