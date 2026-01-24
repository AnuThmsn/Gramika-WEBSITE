import React, { useState, useEffect } from 'react';
import CartItem from '../components/CartItem.jsx';
import '../styles/Cart.css';
import { BsClock } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

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
  const loadCart = async () => {
    const token = localStorage.getItem('gramika_token');
    
    if (!token) {
      // Guest user - load from localStorage
      const guestCart = JSON.parse(localStorage.getItem('gramika_cart') || '[]');
      setCartItems(guestCart);
      return;
    }

    // Logged-in user - load from database
    setLoading(true);
    try {
      const res = await fetch('/api/carts', {
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
          image: product.imageUrl || '/default-product.jpg',
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
    if (isOpen) {
      loadCart();
    }

    const onUpdated = () => {
      if (isOpen) {
        loadCart();
      }
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
      const updatedCart = guestCart.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      );
      localStorage.setItem('gramika_cart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    // Logged-in user - update database
    try {
      // Optimistic UI update
      setCartItems(prev =>
        prev.map(i => (i.id === id ? { ...i, quantity: newQuantity } : i))
      );

      const res = await fetch('/api/carts/item', {
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
      const updatedCart = guestCart.filter(item => item.id !== productId);
      localStorage.setItem('gramika_cart', JSON.stringify(updatedCart));
      setCartItems(updatedCart);
      window.dispatchEvent(new Event('cartUpdated'));
      return;
    }

    // Logged-in user
    try {
      const res = await fetch(`/api/carts/item/${productId}`, {
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
      alert('Please login to proceed to checkout');
      navigate('/login');
      return;
    }

    navigate('/checkout');
  };

  /* ---------------- CLOSE ---------------- */
  const closeCart = () => {
    if (document.activeElement?.blur) document.activeElement.blur();
    onClose();
  };

  /* ---------------- UI ---------------- */
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