import React, { useState, useEffect } from 'react';
import CartItem from '../components/CartItem.jsx';
import '../styles/cart.css';
import { BsClock } from 'react-icons/bs';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { API_BASE, buildImageUrl } from '../config';

const Cart = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /* ---------------- totals ---------------- */
  const itemsTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharge = cartItems.length ? 25 : 0;
  const handlingCharge = cartItems.length ? 2 : 0;
  const grandTotal = itemsTotal + deliveryCharge + handlingCharge;
  const shipmentItemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  /* ---------------- LOAD CART ---------------- */
  const normalizeGuestItem = it => {
    const id = it?.id || it?.product || it?._id;
    const quantity = Number(it?.quantity ?? it?.qty ?? 1) || 1;
    return {
      ...it,
      id,
      quantity,
      stock: Number(it?.stock ?? it?.quantity ?? 0) || 0
    };
  };

  const loadCart = async () => {
    const token = localStorage.getItem('gramika_token');
    
    if (!token) {
      // Guest user - load from localStorage
      const raw = JSON.parse(localStorage.getItem('gramika_cart') || '[]');
      // validate guest cart items: must have id/product and positive quantity
      const guestCart = Array.isArray(raw)
        ? raw
            .filter(it => it && (it.id || it.product || it._id) && Number(it.quantity || it.qty || 0) > 0)
            .map(normalizeGuestItem)
        : [];
      setCartItems(guestCart);
      return;
    }

    // Logged-in user - load from database
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/carts`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!res.ok) {
        if (res.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('gramika_token');
          const guestCart = JSON.parse(localStorage.getItem('gramika_cart') || '[]');
          setCartItems(guestCart);
          return;
        }
        throw new Error(`Failed to load cart: ${res.status}`);
      }
      
      const data = await res.json();
      
      // Transform database cart items to frontend format
      const mapped = (data.items || []).map(item => {
        const product = item.product || {};
        return {
          id: product._id || item.product,
          name: product.name || 'Product',
          price: item.priceAt || product.price || 0,
          quantity: item.qty || 1,
          stock: product.quantity || 0,
          image: buildImageUrl(product.imageUrl || product.image || '/default-product.jpg'),
          status: product.status || 'Active',
          productId: product._id || item.product // Keep original product ID
        };
      }).filter(item => item.id); // Remove items with no ID
      
      setCartItems(mapped);
    } catch (err) {
      console.error('Cart load failed:', err);
      // Fallback to guest cart on error
      const guestCart = JSON.parse(localStorage.getItem('gramika_cart') || '[]');
      setCartItems(guestCart);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- SYNC EVENTS ---------------- */
  useEffect(() => {
    // reload whenever cart opens or when an update event fires
    if (isOpen) {
      loadCart();
    } else {
      // when closing, clear current items (guest may not want persistence)
      setCartItems([]);
      const token = localStorage.getItem('gramika_token');
      if (!token) {
        localStorage.removeItem('gramika_cart');
      }
    }

    const onUpdated = () => {
      if (isOpen) loadCart();
    };
    
    window.addEventListener('cartUpdated', onUpdated);
    
    return () => {
      window.removeEventListener('cartUpdated', onUpdated);
    };
  }, [isOpen]);

  /* ---------------- UPDATE QUANTITY ---------------- */
  const handleUpdateQuantity = async (id, newQuantity) => {
    const token = localStorage.getItem('gramika_token');
    
    if (!token) {
      // Guest user - update localStorage
      const guestCart = JSON.parse(localStorage.getItem('gramika_cart') || '[]');
      const updatedCart = guestCart.map(item => {
        const itemId = item.id || item.product || item._id;
        if (itemId === id) {
          const updated = { ...item, quantity: newQuantity };
          // keep shape normalized for future loads
          return normalizeGuestItem(updated);
        }
        return item;
      });
      localStorage.setItem('gramika_cart', JSON.stringify(updatedCart));
      // update state with normalized data as well
      setCartItems(updatedCart.map(normalizeGuestItem));
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    // Logged-in user - update database
    try {
      // Optimistic UI update
      setCartItems(prev =>
        prev.map(i => (i.id === id ? { ...i, quantity: newQuantity } : i))
      );

      const res = await fetch(`${API_BASE}/api/carts/item`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          product: id, 
          qty: newQuantity,
          priceAt: cartItems.find(item => item.id === id)?.price
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update cart');
      }

      // Refresh cart to ensure consistency
      await loadCart();
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Failed to update quantity:', err);
      // Revert optimistic update
      await loadCart();
    }
  };

  /* ---------------- REMOVE ITEM ---------------- */
  const handleRemove = async (productId) => {
    const token = localStorage.getItem('gramika_token');
    
    if (!token) {
      // Guest user
      const guestCart = JSON.parse(localStorage.getItem('gramika_cart') || '[]');
      const updatedCart = guestCart.filter(item => {
        const itemId = item.id || item.product || item._id;
        return itemId !== productId;
      });
      localStorage.setItem('gramika_cart', JSON.stringify(updatedCart));
      setCartItems(updatedCart.map(normalizeGuestItem));
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    // Logged-in user
    try {
      const res = await fetch(`${API_BASE}/api/carts/item/${productId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${token}` 
        }
      });

      if (!res.ok) {
        throw new Error('Failed to remove item');
      }

      // Update UI
      setCartItems(prev => prev.filter(i => i.id !== productId));
      window.dispatchEvent(new Event('cartUpdated'));
    } catch (err) {
      console.error('Failed to remove item:', err);
      await loadCart();
    }
  };

  /* ---------------- PROCEED TO CHECKOUT ---------------- */
  const handleProceedClick = () => {
    // Check for sold out items
    const soldOutItems = cartItems.filter(item => (item.stock || 0) <= 0);
    if (soldOutItems.length > 0) {
      alert('Your cart contains items that are sold out. Please remove them before proceeding to checkout.');
      return;
    }

    if (!cartItems.length) {
      alert('Your cart is empty');
      return;
    }

    const token = localStorage.getItem('gramika_token');
    if (!token) {
      // Allow guest to click but prompt them to login before proceeding
      if (window.confirm('You need to be logged in to proceed to checkout. Would you like to login now?')) {
        navigate('/login', { state: { from: '/checkout' } });
      }
      return;
    }

    navigate('/checkout');
  };

  /* ---------------- CLOSE ---------------- */
  const closeCart = () => {
    if (document.activeElement?.blur) document.activeElement.blur();
    if (onClose) onClose();
  };

  // If being used as a page (accessed via route), render as a full page
  const isPageView = !isOpen && !onClose;

  /* ---------------- UI ---------------- */
  if (isPageView) {
    // Full page view
    return (
      <div className="cart-page container" style={{ padding: '40px 20px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'flex-start' }}>
          <button
            onClick={() => navigate('/shop')}
            style={{
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              borderRadius: '8px',
              border: '1px solid #195d2bff',
              backgroundColor: 'transparent',
              color: '#195d2bff',
              cursor: 'pointer'
            }}
            title="Continue shopping"
          >
            <FaArrowLeft /> Back to Shop
          </button>
        </div>

        <h1 style={{ marginBottom: '30px', color: '#1a3c22ff' }}>Shopping Cart</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
          {/* Cart Items */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                Loading cart...
              </div>
            ) : cartItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9f9f9', borderRadius: '12px' }}>
                <p style={{ fontSize: '18px', color: '#666', marginBottom: '20px' }}>Your cart is empty.</p>
                <button
                  onClick={() => navigate('/shop')}
                  style={{
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#195d2bff',
                    color: 'white',
                    cursor: 'pointer'
                  }}
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div>
                {cartItems.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemove}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div style={{ backgroundColor: '#f9f9f9', borderRadius: '12px', padding: '20px', height: 'fit-content', top: '40px', position: 'sticky' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', color: '#1a3c22ff' }}>Order Summary</h3>
            
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
              <span>Items total</span>
              <span style={{ fontWeight: 'bold' }}>₹{itemsTotal.toFixed(2)}</span>
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
              <span>Delivery charge</span>
              <span style={{ fontWeight: 'bold' }}>₹{deliveryCharge.toFixed(2)}</span>
            </div>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
              <span>Handling charge</span>
              <span style={{ fontWeight: 'bold' }}>₹{handlingCharge.toFixed(2)}</span>
            </div>

            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: '#1a3c22ff' }}>
              <span>Grand total</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>

            {cartItems.length > 0 && (
              <button 
                onClick={handleProceedClick}
                disabled={cartItems.some(item => (item.stock || 0) <= 0)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#195d2bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  opacity: cartItems.some(item => (item.stock || 0) <= 0) ? 0.6 : 1
                }}
              >
                Proceed to Checkout →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Modal view (sidebar)
  return (
    <>
      <div
        className={`cart-overlay ${isOpen ? 'open' : ''}`}
        onClick={e => e.target === e.currentTarget && closeCart()}
      />

      <div className={`cart-sidebar ${isOpen ? 'open' : ''}`} role="dialog">
        <div className="cart-header">
          <h3>Your Cart</h3>
          <button onClick={closeCart}>✕</button>
        </div>

        <div className="delivery-info">
          <p><BsClock /> Delivery in 20 minutes</p>
          <p>Shipment of {shipmentItemCount} items</p>
        </div>

        <div className="cart-items">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              Loading cart...
            </div>
          ) : cartItems.length === 0 ? (
            <p>Your cart is empty.</p>
          ) : (
            cartItems.map(item => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQuantity={handleUpdateQuantity}
                onRemove={handleRemove}
              />
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <>
            <div className="bill-details">
              <p>Items total <span>₹{itemsTotal.toFixed(2)}</span></p>
              <p>Delivery charge <span>₹{deliveryCharge.toFixed(2)}</span></p>
              <p>Handling charge <span>₹{handlingCharge.toFixed(2)}</span></p>
              <p className="grand-total">
                Grand total <span>₹{grandTotal.toFixed(2)}</span>
              </p>
            </div>

            <div className="cart-footer">
              <span className="total-amount">₹{grandTotal.toFixed(2)}</span>
              <button 
                onClick={handleProceedClick}
                disabled={cartItems.some(item => (item.stock || 0) <= 0)}
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Cart;