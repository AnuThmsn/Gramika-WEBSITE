const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: String,
  price: Number,
  quantity: Number
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [OrderItemSchema],
  total: { type: Number },
  address: { type: String },
  paymentMethod: { type: String },
  status: { type: String, default: 'pending' },
  reportedNotReached: { type: Boolean, default: false }
}, { timestamps: true });

// create an index on createdAt to speed up date range queries
OrderSchema.index({ createdAt: 1 });

module.exports = mongoose.model('Order', OrderSchema);
