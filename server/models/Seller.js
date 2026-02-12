const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  businessEmail: { type: String },
  phone: { type: String },
  address: { type: String },
  aadharFileName: { type: String },
  licenseFileName: { type: String },
  aadharFileId: { type: String },
  licenseFileId: { type: String },
  sellItems: [String],
  category: [String],
  status: { type: String, enum: ['registered','pending','verified'], default: 'registered' }
}, { timestamps: true });

module.exports = mongoose.model('Seller', SellerSchema);