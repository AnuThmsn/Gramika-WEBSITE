import React, { useState, useEffect } from "react";

// This component uploads image to backend (/api/uploads)
// and creates seller product via POST /api/products/seller
const AddProduct = ({ onAddProduct, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    quantity: "",
    category: "",
    imageFile: null,
    imagePreview: ""
  });

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("gramika_token");

      const res = await fetch("/api/categories", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } else {
        setDefaultCategories();
      }
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setDefaultCategories();
    } finally {
      setLoading(false);
    }
  };

  const setDefaultCategories = () => {
    setCategories([
      "Poultry & Meat",
      "Vegetables",
      "Fruits",
      "Dairy & Beverages",
      "Bakery & Snacks",
      "Homemade Essentials"
    ]);
  };

  // Handle text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload (preview only)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct((prev) => ({
        ...prev,
        imageFile: file,       // actual file for backend
        imagePreview: reader.result // preview only
      }));
    };
    reader.readAsDataURL(file);
  };

  // Submit product
  const handleSubmit = async () => {
    try {
      if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
        alert("Please fill name, price and quantity");
        return;
      }

      if (!newProduct.category && categories.length > 0) {
        alert("Please select a category");
        return;
      }

      const fd = new FormData();
      fd.append("name", newProduct.name);
      fd.append("price", newProduct.price);
      fd.append("quantity", newProduct.quantity);
      fd.append("category", newProduct.category);
      fd.append("description", "");

      // IMPORTANT: send actual image file
      if (newProduct.imageFile) {
        fd.append("image", newProduct.imageFile);
      }

      const token = localStorage.getItem("gramika_token");

      const res = await fetch("/api/products/seller", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
          // DO NOT set Content-Type for FormData
        },
        body: fd
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.msg || "Failed to add product");
      }

      const created = await res.json();
      onAddProduct(created);

      // Reset form
      setNewProduct({
        name: "",
        price: "",
        quantity: "",
        category: "",
        imageFile: null,
        imagePreview: ""
      });

      onClose();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="products-add-product-modal">
      <div className="products-modal-content">
        <h3>Add New Product</h3>

        <div className="products-form-group">
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            value={newProduct.name}
            onChange={handleInputChange}
            placeholder="Enter product name"
          />
        </div>

        <div className="products-form-group">
          <label htmlFor="category-select">Category</label>
          <select
            id="category-select"
            name="category"
            value={newProduct.category}
            onChange={handleInputChange}
            disabled={loading || categories.length === 0}
            className="product-form select"
          >
            <option value="">Select Category</option>
            {categories.map((category, index) => (
              <option key={index} value={category}>
                {category}
              </option>
            ))}
          </select>

          {loading && <small className="text-muted">Loading categories...</small>}
          {!loading && categories.length === 0 && (
            <small className="text-danger">
              No categories available. Please contact admin.
            </small>
          )}
        </div>

        <div className="products-form-group">
          <label>Price (₹)</label>
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleInputChange}
            placeholder="Enter price"
            min="0"
            step="0.01"
          />
        </div>

        <div className="products-form-group">
          <label>Quantity</label>
          <input
            type="number"
            name="quantity"
            value={newProduct.quantity}
            onChange={handleInputChange}
            placeholder="Enter quantity"
            min="0"
          />
        </div>

        <div className="products-form-group">
          <label>Product Image</label>
          <input
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
          />
          <small className="text-muted">
            Optional. Recommended for better visibility.
          </small>
        </div>

        {newProduct.imagePreview && (
          <div className="image-preview">
            <img
              src={newProduct.imagePreview}
              alt="Product Preview"
              style={{
                width: "100px",
                height: "100px",
                objectFit: "cover",
                borderRadius: "8px",
                marginTop: "10px"
              }}
            />
          </div>
        )}

        <div className="products-modal-actions">
          <button className="btn" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-add" onClick={handleSubmit}>
            Add Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;