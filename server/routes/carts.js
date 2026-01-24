const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const { auth } = require("../middleware/auth");

// GET cart for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id })
      .populate({
        path: "items.product",
        select: "name price imageUrl quantity status category"
      });

    if (!cart) {
      // Return empty cart if not found
      return res.json({ items: [] });
    }

    // Filter out invalid products (deleted or null)
    const validItems = cart.items.filter(item => item.product);
    
    // If any invalid items were filtered out, update the cart
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.json(cart);
  } catch (err) {
    console.error("Cart fetch error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// ADD or UPDATE item in cart
router.post("/item", auth, async (req, res) => {
  try {
    const { product, qty = 1, priceAt } = req.body;

    // Validate required fields
    if (!product) {
      return res.status(400).json({ msg: "Product ID is required" });
    }

    // Find or create cart for user
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        items: []
      });
    }

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.product.toString() === product
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      if (qty === 0) {
        // Remove item if quantity is 0
        cart.items.splice(existingItemIndex, 1);
      } else {
        // Update quantity
        cart.items[existingItemIndex].qty = qty;
        if (priceAt) {
          cart.items[existingItemIndex].priceAt = priceAt;
        }
      }
    } else {
      // Add new item (only if qty > 0)
      if (qty > 0) {
        cart.items.push({
          product,
          qty,
          priceAt: priceAt || 0 // Will be updated with product price on retrieval
        });
      }
    }

    cart.updatedAt = Date.now();
    await cart.save();

    // Populate product details for response
    await cart.populate({
      path: "items.product",
      select: "name price imageUrl quantity status category"
    });

    res.json(cart);
  } catch (err) {
    console.error("Add to cart error:", err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
});

// REMOVE item from cart
router.delete("/item/:productId", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.json({ items: [] });
    }

    // Filter out the item to remove
    cart.items = cart.items.filter(
      item => item.product.toString() !== req.params.productId
    );

    cart.updatedAt = Date.now();
    await cart.save();

    // Populate remaining items
    await cart.populate({
      path: "items.product",
      select: "name price imageUrl quantity status category"
    });

    res.json(cart);
  } catch (err) {
    console.error("Remove from cart error:", err);
    res.status(500).json({ msg: "Server error" });
  }
});

// CLEAR entire cart
router.delete("/clear", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (cart) {
      cart.items = [];
      cart.updatedAt = Date.now();
      await cart.save();
    }

    res.json({ msg: "Cart cleared", items: [] });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;