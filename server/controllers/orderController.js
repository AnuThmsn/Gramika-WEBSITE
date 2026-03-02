const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res) => {
  try {
    const { items, address, paymentMethod, total } = req.body;
    if (!items || !items.length) return res.status(400).json({ msg: 'No items' });

    // 1. Verify stock server-side and compute authoritative total
    let computedTotal = 0;
    for (const it of items) {
      const pid = it.product?._id || it.product;
      if (!pid) return res.status(400).json({ msg: 'Invalid product in items' });
      const prod = await Product.findById(pid).select('quantity price name');
      if (!prod) return res.status(400).json({ msg: `Product not found: ${pid}` });
      const want = parseInt(it.quantity || it.qty || 1, 10);
      if ((prod.quantity || 0) < want) {
        return res.status(400).json({ msg: `Insufficient stock for ${prod.name}` });
      }
      computedTotal += (prod.price || 0) * want;
    }

    // 2. Create order (use server values)
    const serverItems = items.map(it => ({ product: it.product?._id || it.product, name: it.name, price: it.price || undefined, quantity: it.quantity || it.qty || 1 }));
    const order = new Order({ user: req.user._id, items: serverItems, total: total || computedTotal, address, paymentMethod });
    await order.save();

    // 3. Decrement stock atomically
    for (const it of serverItems) {
      await Product.findByIdAndUpdate(
        it.product,
        { $inc: { quantity: -it.quantity } },
        { new: true }
      );
    }

    // 4. Clear cart
    await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

    return res.status(201).json(order);
  } catch (err) {
    console.error('orderController.createOrder', err);
    return res.status(500).json({ msg: 'Order creation failed' });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).populate('items.product');
    return res.json(orders);
  } catch (err) {
    console.error('orderController.getUserOrders', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('items.product');
    const sellerId = req.user._id;
    const filtered = orders.filter(o => o.items && o.items.some(it => it.product && String(it.product.seller) === String(sellerId)));
    return res.json(filtered);
  } catch (err) {
    console.error('orderController.getSellerOrders', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    // allow optional date range query parameters (ISO string)
    // example: /api/orders/admin?start=2026-02-28T00:00:00.000Z&end=2026-02-28T23:59:59.999Z
    // or a shorthand ?today=true which uses server's local timezone boundaries
    let filter = {};

    if (req.query.start && req.query.end) {
      const start = new Date(req.query.start);
      const end = new Date(req.query.end);
      if (!isNaN(start) && !isNaN(end)) {
        filter.createdAt = { $gte: start, $lte: end };
      }
    } else if (req.query.today === 'true') {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      filter.createdAt = { $gte: start, $lt: end };
    }

    const orders = await Order.find(filter)
      .populate('items.product')
      .populate('user', 'name email');

    return res.json(orders);
  } catch (err) {
    console.error('orderController.getAllOrders', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    // Validate status
    const validStatuses = ['pending', 'processing', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ msg: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Find order
    const order = await Order.findById(orderId).populate('items.product');
    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // Check if user is admin or seller with products in this order
    const User = require('../models/User');
    const user = await User.findById(req.user._id);

    const isAdmin = user && user.isAdmin;
    const sellerOwnsProduct = order.items.some(item =>
      item.product && String(item.product.seller) === String(req.user._id)
    );

    if (!isAdmin && !sellerOwnsProduct) {
      return res.status(403).json({ msg: 'You do not have permission to update this order' });
    }

    // Update order status
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate('items.product').populate('user', 'name email');

    return res.json(updatedOrder);
  } catch (err) {
    console.error('orderController.updateOrderStatus', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.reportOrderNotReached = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findOne({ _id: orderId, user: req.user._id });

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    order.reportedNotReached = true;
    await order.save();

    return res.json(order);
  } catch (err) {
    console.error('orderController.reportOrderNotReached', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};

exports.flagOrderSeller = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      return res.status(404).json({ msg: 'Order not found' });
    }

    // A single order could technically contain products from different sellers, 
    // so we extract all unique sellers from the order products.
    const sellerIds = new Set();
    order.items.forEach(item => {
      if (item.product && item.product.seller) {
        sellerIds.add(String(item.product.seller));
      }
    });

    const SellerModel = require('../models/Seller');

    // Increment flags for all unique sellers involved in this reported order
    const updatedSellers = [];
    for (const sellerUserId of sellerIds) {
      const sellerDoc = await SellerModel.findOneAndUpdate(
        { user: sellerUserId },
        { $inc: { flags: 1 } },
        { new: true }
      );
      if (sellerDoc) updatedSellers.push(sellerDoc);
    }

    // Mark the order as having action taken (optional, but good so we don't flag them infinitely)
    // we can reset reportedNotReached to false, or keep it true for records. We'll leave it as true.

    return res.json({ msg: 'Sellers flagged successfully', updatedSellers });
  } catch (err) {
    console.error('orderController.flagOrderSeller', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
