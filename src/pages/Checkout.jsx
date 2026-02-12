import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Checkout.css';

export default function CheckoutPage() {
  const [cart, setCart] = useState({ items: [] });
  const [processing, setProcessing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem('gramika_token');
      if (!token) { navigate('/login'); return; }
      try {
        const res = await fetch('/api/carts', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed');
        const data = await res.json();
        setCart(data);
        // load addresses from localStorage or backend
        try {
          const meRes = await fetch('/api/users/me', { headers: { Authorization: `Bearer ${token}` } });
          if (meRes.ok) {
            const me = await meRes.json();
            // prefer user.seller.address or saved addresses in localStorage
            const saved = JSON.parse(localStorage.getItem('gramika_addresses') || '[]');
            const list = [];
            if (me.address) list.push(me.address);
            if (me.seller && me.seller.address) list.push(me.seller.address);
            setAddresses(Array.from(new Set([...list, ...saved])));
            if ((Array.from(new Set([...list, ...saved])) || []).length > 0) setSelectedAddress((Array.from(new Set([...list, ...saved])) || [])[0]);
          }
        } catch (e) {
          const saved = JSON.parse(localStorage.getItem('gramika_addresses') || '[]');
          setAddresses(saved);
          if (saved.length) setSelectedAddress(saved[0]);
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

  const placeOrder = async () => {
    const token = localStorage.getItem('gramika_token');
    if (!token) { navigate('/login'); return; }
    setProcessing(true);
    try {
      const items = (cart.items || []).map(it => ({ product: it.product?._id || it.product, name: it.product?.name || it.name, price: it.priceAt || it.product?.price || 0, quantity: it.qty || 1 }));
      const total = getTotal();
      // simulate payment
      await new Promise(r => setTimeout(r, 800));
      const payload = { items, total, address: selectedAddress || newAddress, paymentMethod };
      const res = await fetch('/api/orders', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.msg || 'Order failed');
      }
      const created = await res.json();
      // clear cart on server
      await fetch('/api/carts/clear', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      // notify cart updated and navigate to confirmation/my shop orders
      window.dispatchEvent(new Event('cartUpdated'));
      window.dispatchEvent(new Event('orderUpdated'));
      navigate('/my-shop');
      alert('✅ Order placed successfully!\nOrder ID: ' + (created._id || created.id));
    } catch (err) {
      console.error(err);
      alert('Could not place order');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="checkout-page container">
      <h1>Checkout</h1>
      <div className="checkout-grid">
        <div className="checkout-items">
          <h3>Items</h3>
          {(cart.items || []).length === 0 ? <p>No items in cart.</p> : (
            <ul>
              {cart.items.map(it => (
                <li key={it.product?._id || it.product}>{it.product?.name || 'Product'} — ₹{it.priceAt || it.product?.price} × {it.qty}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="checkout-summary">
          <h3>Summary</h3>
          <div style={{ margin: '12px 0' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Delivery Address</label>
            {addresses.length ? (
              <div>
                {addresses.map((a, idx) => (
                  <div key={idx} style={{ marginBottom: 6 }}>
                    <label>
                      <input type="radio" name="addr" value={a} checked={selectedAddress===a} onChange={() => setSelectedAddress(a)} /> {a}
                    </label>
                  </div>
                ))}
                <div style={{ marginTop: 8 }}>
                  <label>
                    <input type="radio" name="addr" value="__new" checked={!selectedAddress && !!newAddress} onChange={() => { setSelectedAddress(''); }} /> Use new address
                  </label>
                </div>
              </div>
            ) : (
              <p>No saved addresses.</p>
            )}
            <textarea placeholder="Enter delivery address" value={newAddress} onChange={(e) => { setNewAddress(e.target.value); setSelectedAddress(''); }} style={{ width: '100%', minHeight: 60, marginTop: 8 }} />
          </div>

          <div style={{ margin: '12px 0' }}>
            <label style={{ display: 'block', fontWeight: 600, marginBottom: 8 }}>Payment Method</label>
            <div>
              {['UPI','Card','Cash on Delivery'].map(pm => (
                <label key={pm} style={{ display: 'block', marginBottom: 6 }}>
                  <input type="radio" name="pay" value={pm} checked={paymentMethod===pm} onChange={() => setPaymentMethod(pm)} /> {pm}
                </label>
              ))}
            </div>
          </div>
          <p>Subtotal: ₹{getTotal() - 27}</p>
          <p>Delivery & Handling: ₹27</p>
          <p><strong>Total: ₹{getTotal()}</strong></p>
          <button className="btn btn-primary" onClick={placeOrder} disabled={processing || (cart.items || []).length===0}>{processing ? 'Processing…' : 'Place Order'}</button>
        </div>
      </div>
    </div>
  );
}
