// src/components/addproduct.jsx

import React, { useState } from 'react';

const AddProduct = ({ onAddProduct, onClose }) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    image: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct({ ...newProduct, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewProduct({ ...newProduct, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (newProduct.name && newProduct.price && newProduct.quantity && newProduct.image) {
      const product = {
        id: Date.now().toString(),
        name: newProduct.name,
        price: Number(newProduct.price),
        quantity: Number(newProduct.quantity),
        image: newProduct.image,
        status: 'available'
      };
      onAddProduct(product);
      setNewProduct({ name: '', price: '', quantity: '', image: '' });
      onClose();
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
          <label>Price (₹)</label>
          <input
            type="number"
            name="price"
            value={newProduct.price}
            onChange={handleInputChange}
            placeholder="Enter price"
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
        </div>
        {newProduct.image && (
          <div className="image-preview">
            <img src={newProduct.image} alt="Product Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
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