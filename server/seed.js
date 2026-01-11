const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const Product = require('./models/Product');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

const products = [
  { name: 'Egg', price: 10, category: 'Poultry & Meat', image: 'egg.jpeg', quantity: 50 },
  { name: 'Milk', price: 20, category: 'Dairy & Beverages', image: 'milk.jpeg', quantity: 50 },
  { name: 'Chocolates', price: 250, category: 'Bakery & Snacks', image: 'Homemade chocolates.webp', quantity: 30 },
  { name: 'Chicken', price: 250, category: 'Poultry & Meat', image: 'chicken.jpeg', quantity: 20 },
  { name: 'Bun', price: 30, category: 'Bakery & Snacks', image: 'buns.webp', quantity: 40 },
  { name: 'Butter Bun', price: 50, category: 'Bakery & Snacks', image: 'Butter Buns.jpg', quantity: 12 },
  { name: 'Coconut Oil', price: 250, category: 'Homemade Essentials', image: 'Coconut oil.jpeg', quantity: 10 }
];

const run = async () => {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log('Seeded products');

  // Create or update admin user
  const adminExists = await User.findOne({ email: 'admin@gramika.com' });
  const hash = await bcrypt.hash('admin123', 10);
  if (!adminExists) {
    const admin = new User({
      name: 'Admin',
      email: 'admin@gramika.com',
      password: hash,
      isAdmin: true
    });
    await admin.save();
    console.log('Created admin user: admin@gramika.com / admin123');
  } else {
    adminExists.password = hash;
    adminExists.isAdmin = true;
    await adminExists.save();
    console.log('Updated admin user: admin@gramika.com / admin123');
  }

  process.exit(0);
};

run().catch(err => { console.error(err); process.exit(1); });
