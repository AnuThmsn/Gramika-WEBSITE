// src/components/CartItem.js
import React from 'react';
import '../styles/cart.css'; // Import cart specific styles (match actual filename)

const CartItem = ({ item, onUpdateQuantity, onRemove }) => {
    const soldOut = (item.stock || 0) <= 0;
    const canDecrease = item.quantity > 1;
    // allow increase when stock is undefined, zero, or quantity less than stock
    const canIncrease = !soldOut && (
      item.stock === undefined || item.stock === 0 || item.quantity < item.stock
    );

    return (
        <div className="cart-item">
            <img src={item.image} alt={item.name} />
            <div className="item-details">
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                  <p className="item-name">{item.name} {soldOut && <span style={{color:'#c0392b', marginLeft:8, fontWeight:700}}>Sold out</span>}</p>
                  <button onClick={() => onRemove && onRemove(item.id || item.product)} style={{background:'transparent',border:'none',color:'#888',cursor:'pointer',fontSize:14}}>Remove</button>
                </div>
                {item.volume && <p className="item-volume">{item.volume}</p>}
                <p className="item-price">₹{item.price} <span style={{color:'#666', fontSize:12}}>each</span></p>
                <p className="item-line-total" style={{fontWeight:700}}>₹{(item.price * (item.quantity || 0)).toFixed(0)}</p>
            </div>
            <div className="quantity-controls">
                <button
                  onClick={() =>
                    onUpdateQuantity &&
                    onUpdateQuantity(item.id || item.product, Math.max(1, item.quantity - 1))
                  }
                  disabled={!canDecrease}
                >
                  -
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button
                  onClick={() =>
                    onUpdateQuantity &&
                    onUpdateQuantity(item.id || item.product, item.quantity + 1)
                  }
                  disabled={!canIncrease}
                >
                  +
                </button>
            </div>
        </div>
    );
};

export default CartItem;