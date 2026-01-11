const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const checkAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'admin@gramika.com' });
  if (user) {
    console.log('Admin user found:', user.name, user.email, user.isAdmin);
    const match = await bcrypt.compare('admin123', user.password);
    console.log('Password match:', match);
  } else {
    console.log('Admin user not found');
  }
  process.exit(0);
};

checkAdmin().catch(console.error);