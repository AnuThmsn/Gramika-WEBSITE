const Product = require("../models/Product");

exports.createProduct = async (req, res) => {
  try {
    const imageUrl = req.file ? `/api/uploads/${req.file.filename}` : "";

    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      category: req.body.category,
      description: req.body.description,
      quantity: req.body.quantity,
      seller: req.user._id,   // comes from auth middleware
      imageUrl,
      status: "Pending"
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getProducts = async (req, res) => {
  const products = await Product.find()
    .populate("seller", "name");

  res.json(products);
};

exports.updateProductStatus = async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json(product);
};

exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Product deleted" });
};
