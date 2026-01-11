const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ msg: 'No token' });
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = await User.findById(data.id).select('-password');
    if (!user) return res.status(401).json({ msg: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid token' });
  }
};

const admin = (req, res, next) => {
  if (!req.user) return res.status(401).json({ msg: 'Not authenticated' });
  if (!req.user.isAdmin) return res.status(403).json({ msg: 'Admin only' });
  next();
};

module.exports = { auth, admin };