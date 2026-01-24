import React, { useState, useEffect } from 'react';
import trial_pic from "../assets/trial_pic.jpg"; // fallback image
import AddProduct from './addproduct';
import './Product.css';
import { CiCirclePlus } from "react-icons/ci";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);

  // load only products created by the logged-in seller
  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('gramika_token');

const res = await fetch('/api/products', {
  headers: {
    Authorization: `Bearer ${token}`
  }
});

        if (!res.ok) {
          if (mounted) setProducts([]);
          return;
        }
        const all = await res.json();
        const sellerId = localStorage.getItem('gramika_user_id');
        if (!sellerId) {
          if (mounted) setProducts([]);
          return;
        }
        const normalizeImage = (p) => {
          let img = p.imageUrl || '';
          if (img && /^[a-f0-9]{24}$/i.test(img)) img = `/api/uploads/${img}`;
          if (!img && p.imageGridFsId) img = `/api/uploads/${p.imageGridFsId}`;
          return img;
        };

        const mine = all
          .filter(p => {
            if (!p) return false;
            if (!p.seller) return false;
            if (typeof p.seller === 'string') return p.seller === sellerId;
            if (p.seller._id) return String(p.seller._id) === sellerId;
            return String(p.seller) === sellerId;
          })
          .map(p => ({
            ...p,
            id: p._id || p.id || String(Math.random()).slice(2,8),
            _imageForUI: normalizeImage(p)
          }));
        if (mounted) setProducts(mine);
      } catch (err) {
        console.error('Failed loading seller products', err);
        if (mounted) setProducts([]);
      }
    };
    fetchProducts();
    const onOrder = fetchProducts;
    window.addEventListener('orderUpdated', onOrder);
    return () => { mounted = false; window.removeEventListener('orderUpdated', onOrder); };
  }, []);

  const addProduct = (newProduct) => {
    // normalize backend-created product shape
    const normalized = {
      id: newProduct._id || newProduct.id || String(Math.random()).slice(2,8),
      name: newProduct.name || newProduct.title || 'Product',
      price: newProduct.price || 0,
      quantity: newProduct.quantity || newProduct.qty || 0,
      image: newProduct.imageUrl || newProduct.image || trial_pic,
      status: (newProduct.quantity || newProduct.qty || 0) > 0 ? 'available' : 'sold-out'
    };
    setProducts(prev => [...prev, normalized]);
  };

  const updateQuantity = (id, change) => {
    setProducts(products.map(product => {
      if (product.id === id) {
        const newQuantity = Math.max(0, product.quantity + change);
        // optimistic update locally
        const updated = {
          ...product,
          quantity: newQuantity,
          status: newQuantity === 0 ? 'sold-out' : 'available'
        };
        // persist change to server (if seller authorized)
        (async () => {
          try {
            const token = localStorage.getItem('gramika_token');
            if (!token) return;
            const body = { quantity: newQuantity };
            const res = await fetch(`/api/products/${product.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify(body)
            });
            if (!res.ok) {
              const err = await res.json().catch(() => null);
              console.error('Failed to persist product quantity', err || await res.text());
            }
          } catch (e) {
            console.error('Failed to persist product quantity', e);
          }
        })();
        return updated;
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

  const deleteProduct = async (id) => {
  try {
    const token = localStorage.getItem("gramika_token");
    if (!token) {
      alert("Not authorized");
      return;
    }

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.msg || "Failed to delete product");
    }

    // ✅ Remove from UI only AFTER backend success
    setProducts(prev => prev.filter(product => product.id !== id));
  } catch (err) {
    console.error("Delete failed:", err);
    alert(err.message);
  }
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
        {products.length === 0 ? (
          <div className="no-products-placeholder">No products yet. Add your first product.</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                <img src={product._imageForUI || product.image} alt={product.name} />
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
          ))
        )}
      </div>
    </div>
  );
};

export default Products;