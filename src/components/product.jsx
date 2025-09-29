import React, { useState } from 'react';
import trial_pic from "../assets/trial_pic.jpg"; // Correctly import your image
import AddProduct from './addproduct';
import './Product.css';
import { CiCirclePlus } from "react-icons/ci";

const Products = () => {
  const [products, setProducts] = useState([
    { id: '1', name: 'Fresh Milk', price: 25, quantity: 50, image: trial_pic, status: 'available' },
    { id: '2', name: 'Farm Eggs', price: 60, quantity: 0, image: trial_pic, status: 'sold-out' },
    { id: '3', name: 'Organic Chicken', price: 200, quantity: 15, image: trial_pic, status: 'available' }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  const addProduct = (newProduct) => {
    setProducts([...products, newProduct]);
  };

  const updateQuantity = (id, change) => {
    setProducts(products.map(product => {
      if (product.id === id) {
        const newQuantity = Math.max(0, product.quantity + change);
        return {
          ...product,
          quantity: newQuantity,
          status: newQuantity === 0 ? 'sold-out' : 'available'
        };
      }
      return product;
    }));
  };

  const toggleStatus = (id) => {
    setProducts(products.map(product => {
      if (product.id === id) {
        return {
          ...product,
          status: product.status === 'available' ? 'sold-out' : 'available'
        };
      }
      return product;
    }));
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(product => product.id !== id));
  };

  return (
    <div className="products-content-wrapper">
      <div className="products-section-header">
        <h1 className="products-section-title">Products</h1>
        <button
          className="btn btn-add"
          onClick={() => setShowAddForm(true)}
        >
          <span className="add-icon"><CiCirclePlus style={{ color: 'white', fontSize: '24px' }} /></span> Add Product
        </button>
      </div>

      {showAddForm && (
        <AddProduct
          onAddProduct={addProduct}
          onClose={() => setShowAddForm(false)}
        />
      )}

      <div className="products-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              <img src={product.image} alt={product.name} />
            </div>
            <div className="product-info">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-price">₹{product.price}</div>
              <div className="products-qty-container">
                <span>Quantity: {product.quantity}</span>
                <div className="products-quantity-buttons">
                  <button
                    className="products-qty-btn"
                    onClick={() => updateQuantity(product.id, -1)}
                  >
                    -
                  </button>
                  <button
                    className="products-qty-btn"
                    onClick={() => updateQuantity(product.id, 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              <div className={`products-status ${product.status}`}>
                {product.status === 'available' ? '✅ Available' : '❌ Sold Out'}
              </div>
              <div className="products-action-buttons">
                <button
                  className="btn"
                  onClick={() => toggleStatus(product.id)}
                >
                  Toggle Status
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => deleteProduct(product.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;