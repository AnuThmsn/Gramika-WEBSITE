import React, { useEffect, useState } from 'react';
import { API_BASE } from '../config';
import { useNavigate } from 'react-router-dom';
import '../styles/Checkout.css';

export default function CheckoutPage() {
  const [cart, setCart] = useState({ items: [] });
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('gramika_token');
      if (!token) { navigate('/login'); return; }
      try {
        const res = await fetch(`${API_BASE}/api/carts`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setCart(data);
        // load addresses from localStorage or backend
        try {
          const meRes = await fetch(`${API_BASE}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } });
          if (meRes.ok) {
            const me = await meRes.json();
            const saved = JSON.parse(localStorage.getItem('gramika_addresses') || '[]');
            const list = [];
            if (me.address) list.push(me.address);
            if (me.seller && me.seller.address) list.push(me.seller.address);
            const mergedAddresses = Array.from(new Set([...list, ...saved]));
            setAddresses(mergedAddresses);
            // Don't auto-select so user is forced to pick one
            if (mergedAddresses.length === 1) {
              setSelectedAddress(mergedAddresses[0]);
            }
          }
        } catch (e) {
          const saved = JSON.parse(localStorage.getItem('gramika_addresses') || '[]');
          setAddresses(saved);
        }
      } catch (err) {
        console.error('Could not load cart', err);
      }
    };
    load();
  }, []);

  const getTotal = () => {
    return (cart.items || []).reduce((s, it) => s + ((it.priceAt || (it.product && it.product.price)) * (it.qty || 1)), 0) + 27; // delivery+handling
  };

  const getEffectiveAddress = () => {
    return selectedAddress === '__new' ? newAddress : selectedAddress;
  };

  const placeOrder = async () => {
    const finalAddress = getEffectiveAddress();
    if (!finalAddress || finalAddress.trim().length === 0) {
      alert("Please select or enter a delivery address first.");
      return;
    }

    const token = localStorage.getItem('gramika_token');
    if (!token) { navigate('/login'); return; }
    setProcessing(true);
    try {
      const items = (cart.items || []).map(it => ({
        product: it.product?._id || it.product,
        name: it.product?.name || it.name,
        price: it.priceAt || it.product?.price || 0,
        quantity: it.qty || 1
      }));
      const total = getTotal();

      // simulate payment
      await new Promise(r => setTimeout(r, 800));

      // Payment method is hardcoded to "Cash on Delivery"
      const payload = { items, total, address: finalAddress, paymentMethod: 'Cash on Delivery' };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || 'Order failed');
      }
      const created = await res.json();

      // clear cart on server
      await fetch(`${API_BASE}/api/carts/clear`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });

      // Save newly entered address to local storage
      if (selectedAddress === '__new' && newAddress.trim().length > 0) {
        const saved = JSON.parse(localStorage.getItem('gramika_addresses') || '[]');
        if (!saved.includes(newAddress)) {
          saved.push(newAddress);
          localStorage.setItem('gramika_addresses', JSON.stringify(saved));
        }
      }

      // notify cart updated and navigate to my shop orders
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('orderUpdated'));
      alert('✅ Order placed successfully!\nOrder ID: ' + (created._id || created.id));
      navigate('/profile'); // Sending user to profile so they can see their recent orders
    } catch (err) {
      console.error(err);
      alert('Could not place order');
    } finally {
      setProcessing(false);
    }
  };

  // Extract seller phone mapping for display
  const sellerPhones = Array.from(new Set(
    (cart.items || []).map(it => {
      const seller = it.product?.seller;
      if (!seller) return null;
      return seller.seller?.phone || seller.phone || null;
    }).filter(Boolean)
  ));

  return (
    <div className="checkout-page-modal-wrapper">
      <div className="checkout-modal-overlay" onClick={() => navigate(-1)}></div>

      <div className="checkout-modal-content">
        <div className="checkout-modal-header">
          <h2>Complete Your Order</h2>
          <button className="close-checkout-btn" onClick={() => navigate(-1)}>✕</button>
        </div>

        <div className="checkout-modal-body">
          {/* STEP 1: Address */}
          <div className="checkout-section target-address-section">
            <h3>1. Delivery Address</h3>
            <div className="address-options-box">
              {addresses.length > 0 && addresses.map((a, idx) => (
                <label key={idx} className={`address-radio-label ${selectedAddress === a ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="addr"
                    value={a}
                    checked={selectedAddress === a}
                    onChange={() => setSelectedAddress(a)}
                  />
                  <span className="address-text">{a}</span>
                </label>
              ))}

              <label className={`address-radio-label ${selectedAddress === '__new' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="addr"
                  value="__new"
                  checked={selectedAddress === '__new'}
                  onChange={() => { setSelectedAddress('__new'); }}
                />
                <span className="address-text">Add a new delivery address</span>
              </label>

              {selectedAddress === '__new' && (
                <textarea
                  className="new-address-input"
                  placeholder="Enter full address, pincode, and landmarks..."
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                />
              )}
            </div>
          </div>

          {/* STEP 2: Items & Seller Info */}
          <div className="checkout-section">
            <h3>2. Order Summary</h3>
            <div className="cart-items-preview">
              {(cart.items || []).length === 0 ? <p>No items in cart.</p> : (
                <ul className="checkout-items-list">
                  {cart.items.map((it, i) => (
                    <li key={i} className="checkout-item-line">
                      <span className="item-name">{it.product?.name || 'Product'} × {it.qty}</span>
                      <span className="item-price">₹{((it.priceAt || it.product?.price) * (it.qty || 1)).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {sellerPhones.length > 0 && (
              <div className="checkout-seller-contact">
                <p><strong>Seller Contact(s):</strong> {sellerPhones.join(', ')}</p>
                <small>You can contact the seller directly for delivery instructions.</small>
              </div>
            )}
          </div>

          {/* STEP 3: Payment */}
          <div className="checkout-section">
            <h3>3. Payment</h3>
            <div className="payment-delivery-message">
              <span className="info-icon">ℹ️</span>
              <p>Due to small distance, payment can be done on delivery.</p>
            </div>
            <div className="payment-method-box">
              <label className="payment-radio-label selected">
                <input type="radio" checked readOnly />
                <span className="payment-text">Cash on Delivery (Pay on Delivery)</span>
              </label>
            </div>
          </div>

          {/* TOTALS */}
          <div className="checkout-totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>₹{(getTotal() - 27).toFixed(2)}</span>
            </div>
            <div className="totals-row">
              <span>Delivery & Handling</span>
              <span>₹27.00</span>
            </div>
            <div className="totals-row grand-total">
              <span>Total to Pay</span>
              <span>₹{getTotal().toFixed(2)}</span>
            </div>
          </div>

        </div>

        <div className="checkout-modal-footer">
          <button
            className="btn checkout-place-btn"
            onClick={placeOrder}
            disabled={processing || (cart.items || []).length === 0}
          >
            {processing ? 'Processing Order...' : `Place Order (₹${getTotal()})`}
          </button>
        </div>
      </div>
    </div>
  );
}
