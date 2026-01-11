import React, { useEffect, useState } from "react";
import "../styles/Checkout.css";

export default function CheckoutModal({ open, onClose, cartItems = [] }) {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      const token = localStorage.getItem("gramika_token");
      const saved = JSON.parse(localStorage.getItem("gramika_addresses") || "[]");

      try {
        if (token) {
          const res = await fetch("/api/users/me", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const me = await res.json();
            const list = [];
            if (me.address) list.push(me.address);
            if (me.seller?.address) list.push(me.seller.address);
            const combined = Array.from(new Set([...list, ...saved]));
            setAddresses(combined);
            if (combined.length) setSelectedAddress(combined[0]);
            return;
          }
        }
      } catch {}

      setAddresses(saved);
      if (saved.length) setSelectedAddress(saved[0]);
    };

    load();
  }, [open]);

  const subtotal = cartItems.reduce(
    (s, it) => s + it.price * it.quantity,
    0
  );
  const delivery = 27;
  const total = subtotal + delivery;

  const placeOrder = async () => {
    if (!cartItems.length) return alert("Your cart is empty");

    const token = localStorage.getItem("gramika_token");
    if (!token) return (window.location.href = "/login");

    const address = selectedAddress || newAddress;
    if (!address) return alert("Please enter delivery address");

    setProcessing(true);
    try {
      const payload = {
        items: cartItems.map(it => ({
          product: it.id,
          name: it.name,
          price: it.price,
          quantity: it.quantity
        })),
        address,
        paymentMethod,
        total
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Order failed");

      await fetch("/api/carts", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      window.dispatchEvent(new Event("cartUpdated"));
      alert("Order placed successfully!");
      onClose();
    } catch (e) {
      alert("Could not place order");
    } finally {
      setProcessing(false);
    }
  };

  if (!open) return null;

  return (
    <div className="checkout-modal-backdrop">
      <div className="checkout-modal">
        <div className="checkout-modal-header">
          <h3>Checkout</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="checkout-modal-body">
          {/* LEFT — ITEMS */}
          <div className="checkout-items-list">
            <h4>Items</h4>

            {!cartItems.length && (
              <p className="muted">Your cart is empty</p>
            )}

            {cartItems.map(it => (
              <div className="checkout-item-card" key={it.id}>
                <img
                  src={it.image || "/placeholder-product.png"}
                  alt={it.name}
                  className="checkout-item-image"
                />

                <div className="checkout-item-info">
                  <div className="checkout-item-name">{it.name}</div>
                  <div className="checkout-item-meta">
                    ₹{it.price} × {it.quantity}
                  </div>
                </div>

                <div className="checkout-item-total">
                  ₹{it.price * it.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — SUMMARY */}
          <div className="checkout-controls checkout-summary-sticky">
            <label>Delivery Address</label>

            {addresses.map((a, i) => (
              <label key={i} className="option-row">
                <input
                  type="radio"
                  checked={selectedAddress === a}
                  onChange={() => setSelectedAddress(a)}
                />
                {a}
              </label>
            ))}

            <label className="option-row">
              <input
                type="radio"
                checked={!selectedAddress}
                onChange={() => setSelectedAddress("")}
              />
              Use new address
            </label>

            <textarea
              placeholder="Enter delivery address"
              value={newAddress}
              onChange={e => {
                setNewAddress(e.target.value);
                setSelectedAddress("");
              }}
            />

            <label style={{ marginTop: 12 }}>Payment Method</label>
            {["UPI", "Card", "Cash on Delivery"].map(pm => (
              <label key={pm} className="option-row">
                <input
                  type="radio"
                  checked={paymentMethod === pm}
                  onChange={() => setPaymentMethod(pm)}
                />
                {pm}
              </label>
            ))}

            <div className="checkout-summary-mini">
              <div><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div><span>Delivery</span><span>₹{delivery}</span></div>
              <div className="total">
                <span>Total</span>
                <span>₹{total}</span>
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={placeOrder}
              disabled={processing}
            >
              {processing ? "Processing…" : "Place Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
