const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String },
  // imageUrl: external URL (S3/Cloudinary) OR
  imageUrl: { type: String },
  // imageGridFsId: ObjectId string when stored in GridFS
  imageGridFsId: { type: mongoose.Schema.Types.ObjectId },
  // reference to seller (user) who added this product
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quantity: { type: Number, default: 0 },
  description: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
