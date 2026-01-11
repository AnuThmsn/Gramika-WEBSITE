const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  pincode: { type: String },
  isAdmin: { type: Boolean, default: false },
  // seller-related fields
  isSeller: { type: Boolean, default: false },
  seller: {
    shopName: { type: String },
    category: { type: String },
    businessEmail: { type: String },
    phone: { type: String },
    address: { type: String },
    licenseFileName: { type: String },
    aadharFileName: { type: String },
    status: { type: String, enum: ['not_seller','registered','pending','verified'], default: 'not_seller' }
  }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
