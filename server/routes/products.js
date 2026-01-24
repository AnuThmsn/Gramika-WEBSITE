const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const { auth, admin } = require("../middleware/auth");
const upload = require("../middleware/upload");

/* ======================================================
   GET /api/products
   - Admin  → all products
   - Seller → own products (Active + Rejected)
====================================================== */
router.get("/", auth, async (req, res) => {
  try {
    const q = req.query.q || "";
    const filter = {};

    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    // Seller → only own products
    if (req.user.isSeller && !req.user.isAdmin) {
      filter.seller = req.user._id;
    }

    const products = await Product.find(filter)
      .populate("seller", "name email")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* ======================================================
   BUY PAGE (PUBLIC)
   GET /api/products/public
   ONLY Active + in-stock
====================================================== */
router.get("/public", async (req, res) => {
  try {
    const q = req.query.q || "";
    const filter = {
      status: { $in: ["Active", "Reported"] }
    };

    if (q) {
      filter.name = { $regex: q, $options: "i" };
    }

    const products = await Product.find(filter)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
/* ======================================================
   GET SINGLE PRODUCT (PUBLIC)
====================================================== */
router.get("/public/:id", async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product || product.status !== "Active") {
    return res.status(404).json({ msg: "Not available" });
  }
  res.json(product);
});

/* ======================================================
   POST /api/products
   Admin adds → Active
====================================================== */
router.post("/", auth, admin, upload.single("image"), async (req, res) => {
  try {
    const imageUrl = req.file ? `/api/uploads/${req.file.filename}` : "";

    const product = new Product({
      ...req.body,
      imageUrl,
      status: "Active"
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

/* ======================================================
   POST /api/products/seller
   Seller adds → Active (default)
====================================================== */
router.post(
  "/seller",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const imageUrl = req.file ? `/api/uploads/${req.file.filename}` : "";

      const product = new Product({
        ...req.body,
        seller: req.user._id,
        imageUrl,
        status: "Active"
      });

      await product.save();
      res.status(201).json(product);
    } catch (err) {
      res.status(400).json({ msg: err.message });
    }
  }
);

/* ======================================================
   ADMIN REJECT PRODUCT
   PUT /api/products/:id/reject
====================================================== */
router.put("/:id/reject", auth, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { status: "Rejected" },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

/* ======================================================
   UPDATE PRODUCT
   - Admin → full access
   - Seller → own product (NO status change)
====================================================== */
router.put("/:id", auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Not found" });

    if (
      !req.user.isAdmin &&
      String(product.seller) !== String(req.user._id)
    ) {
      return res.status(403).json({ msg: "Forbidden" });
    }

    // Sellers cannot change status
    if (!req.user.isAdmin) {
      delete req.body.status;
    }

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
});

/* ======================================================
   DELETE PRODUCT – ADMIN ONLY
====================================================== */
router.delete("/:id", auth, async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) return res.status(404).json({ msg: "Not found" });

  if (!req.user.isAdmin && String(product.seller) !== String(req.user._id)) {
    return res.status(403).json({ msg: "Forbidden" });
  }

  await product.deleteOne();
  res.json({ ok: true });
});
// REPORT PRODUCT (PUBLIC)
router.put("/public/:id/report", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ msg: "Not found" });

    product.reports += 1;
    product.status = "Reported";
    await product.save();

    res.json({ reports: product.reports, status: product.status });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});
module.exports = router;
