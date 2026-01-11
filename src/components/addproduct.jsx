// src/components/addproduct.jsx

import React, { useState } from 'react';

// This component now uploads image to backend (/api/uploads) and then creates
// a seller product via POST /api/products/seller using auth token from localStorage.
const AddProduct = ({ onAddProduct, onClose }) => {
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    quantity: '',
    imageFile: null,
    imagePreview: ''
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
        setNewProduct({ ...newProduct, imageFile: file, imagePreview: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/uploads', { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Upload failed');
    const data = await res.json();
    // return URL that can be used directly in <img>
    return `/api/uploads/${data.fileId}`;
  };

  const handleSubmit = async () => {
    try {
      if (!newProduct.name || !newProduct.price || !newProduct.quantity) {
        alert('Please fill name, price and quantity');
        return;
      }

      let imageUrl = '';
      if (newProduct.imageFile) {
        imageUrl = await uploadFile(newProduct.imageFile);
      }

      const productPayload = {
        name: newProduct.name,
        price: Number(newProduct.price),
        quantity: Number(newProduct.quantity),
        imageUrl,
        description: ''
      };

      // read token from localStorage (frontend login should store it)
      const token = localStorage.getItem('gramika_token');

      const createRes = await fetch('/api/products/seller', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(productPayload)
      });

      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}));
        throw new Error(err.msg || 'Failed to create product');
      }

      const created = await createRes.json();
      // call parent callback so UI updates immediately
      onAddProduct(created);
      setNewProduct({ name: '', price: '', quantity: '', imageFile: null, imagePreview: '' });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to add product: ' + err.message);
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
        {newProduct.imagePreview && (
          <div className="image-preview">
            <img src={newProduct.imagePreview} alt="Product Preview" style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
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