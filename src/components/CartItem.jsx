// src/components/CartItem.js
import React from 'react';
import '../pages/Cart.css'; // Import cart specific styles

const CartItem = ({ item, onUpdateQuantity }) => {
    return (
        <div className="cart-item">
            <img src={item.image} alt={item.name} />
            <div className="item-details">
                <p className="item-name">{item.name}</p>
                <p className="item-volume">{item.volume}</p>
                <p className="item-price">₹{item.price}</p>
            </div>
            <div className="quantity-controls">
                <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>-</button>
                <span className="quantity-value">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
        </div>
    );
};

export default CartItem;