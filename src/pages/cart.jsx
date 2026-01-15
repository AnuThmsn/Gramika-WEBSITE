import React, { useState, useEffect } from 'react';
import CartItem from '../components/CartItem.jsx';
import '../styles/Cart.css';
import { BsClock } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

const Cart = ({ isOpen, onClose }) => {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  /* ---------------- totals ---------------- */
  const itemsTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const deliveryCharge = cartItems.length ? 25 : 0;
  const handlingCharge = cartItems.length ? 2 : 0;
  const grandTotal = itemsTotal + deliveryCharge + handlingCharge;
  const shipmentItemCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  /* ---------------- AUTH GUARD ---------------- */


  /* ---------------- LOAD CART ---------------- */
  const loadCart = async () => {
    const token = localStorage.getItem('gramika_token');
    if (!token) {
      setCartItems([]);
      return;
    }

    try {
      const res = await fetch('/api/carts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load cart');
      const data = await res.json();

      const mapped = (data.items || [])
  // 🔥 REMOVE BROKEN CART ITEMS
  .filter(i => i.product && (i.product._id || i.product))
  .map(i => ({
    id: i.product._id,
    name: i.product.name,
    price: i.priceAt || i.product.price || 0,
    quantity: i.qty || 1,
    stock: i.product.quantity,
    image:
      i.product.imageUrl ||
      (i.product.imageGridFsId
        ? `/api/uploads/${i.product.imageGridFsId}`
        : '')
  }));
const brokenItems = (data.items || []).filter(i => !i.product);

for (const item of brokenItems) {
  await fetch(`/api/carts/item/${item._id || item.product}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
}

setCartItems(mapped);

    } catch (err) {
      console.error('Cart load failed', err);
      setCartItems([]);
    }
  };

  /* ---------------- SYNC EVENTS ---------------- */
  useEffect(() => {
    if (isOpen) loadCart();

    const onUpdated = () => loadCart();
    window.addEventListener('cartUpdated', onUpdated);
    return () => window.removeEventListener('cartUpdated', onUpdated);
  }, [isOpen]);

  /* ---------------- UPDATE QUANTITY ---------------- */
  const handleUpdateQuantity = async (id, newQuantity) => {
    if (newQuantity <= 0) {
      await handleRemove(id);
      return;
    }

    const token = localStorage.getItem('gramika_token');

    // optimistic UI
    setCartItems(prev =>
      prev.map(i => (i.id === id ? { ...i, quantity: newQuantity } : i))
    );

    await fetch('/api/carts/item', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ product: id, qty: newQuantity })
    });

    window.dispatchEvent(new Event('cartUpdated'));
  };

  /* ---------------- REMOVE ITEM ---------------- */
  const handleRemove = async productId => {
    const token = localStorage.getItem('gramika_token');
    if (!token) return;

    await fetch(`/api/carts/item/${productId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    setCartItems(prev => prev.filter(i => i.id !== productId));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  /* ---------------- PROCEED ---------------- */
  const handleProceedClick = () => {
    if (cartItems.some(item => (item.stock || 0) <= 0)) {
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
          {cartItems.length === 0 ? (
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
              <p>Items total <span>₹{itemsTotal}</span></p>
              <p>Delivery charge <span>₹{deliveryCharge}</span></p>
              <p>Handling charge <span>₹{handlingCharge}</span></p>
              <p className="grand-total">
                Grand total <span>₹{grandTotal}</span>
              </p>
            </div>

            <div className="cart-footer">
              <span className="total-amount">₹{grandTotal}</span>
              <button onClick={handleProceedClick}>
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
