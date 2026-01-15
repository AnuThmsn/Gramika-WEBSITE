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
      const updated = await Product.findByIdAndUpdate(
  it.product,
  { $inc: { quantity: -it.quantity } },
  { new: true }
);

if (updated.quantity <= 0) {
  updated.status = 'OutOfStock';
  await updated.save();
}

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
    const orders = await Order.find({}).populate('items.product').populate('user', 'name email');
    return res.json(orders);
  } catch (err) {
    console.error('orderController.getAllOrders', err);
    return res.status(500).json({ msg: 'Server error' });
  }
};
