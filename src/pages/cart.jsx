// src/pages/cart.jsx (Your Cart Component)
import React, { useState, useEffect } from 'react';
import CartItem from '../components/CartItem.jsx';
import './Cart.css';
import trialPic from '../assets/trial_pic.jpg';

import { BsClock } from 'react-icons/bs'; // Keep BsClock for Delivery in 20 minutes
// No more BsListUl, BsBag, BsTruck imports if you're not using them

const Cart = ({ isOpen, onClose, onProceedToPayment }) => { // <-- change here
    const [cartItems, setCartItems] = useState([
        { id: 'coke', name: 'Coca-Cola Soft Drink', volume: '750 ml', price: 45, quantity: 1, image: trialPic },
        { id: 'sprite', name: 'Sprite Lime Flavored Soft Drink', volume: '750 ml', price: 45, quantity: 1, image: trialPic }
    ]);

    const itemsTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryCharge = 25;
    const handlingCharge = 2;
    const grandTotal = itemsTotal + deliveryCharge + handlingCharge;
    const shipmentItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    const handleUpdateQuantity = (id, newQuantity) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id
                    ? { ...item, quantity: Math.max(0, newQuantity) }
                    : item
            ).filter(item => item.quantity > 0)
        );
    };

    useEffect(() => {
        if (isOpen) {
            // console.log("Cart is open!");
        } else {
            // console.log("Cart is closed!");
        }
    }, [isOpen]);

    const handleProceedClick = () => {
        onProceedToPayment(grandTotal); // <-- change here
    };

    return (
        <div className={`cart-sidebar ${isOpen ? 'open' : ''}`}>
            <div className="cart-header">
                <h2>My Cart</h2>
                <button className="close-cart" onClick={onClose}>&times;</button>
            </div>

            <div className="delivery-info">
                <p><BsClock className="icon" /> Delivery in 20 minutes</p>
                <p>Shipment of {shipmentItemCount} items</p>
            </div>

            <div className="cart-items">
                {cartItems.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    cartItems.map(item => (
                        <CartItem key={item.id} item={item} onUpdateQuantity={handleUpdateQuantity} />
                    ))
                )}
            </div>

            <div className="bill-details">
                {/* REMOVED ICONS HERE */}
                <p> Items total <span>₹{itemsTotal}</span></p>
                <p> Delivery charge<span>₹{deliveryCharge} </span></p>
                <p> Handling charg<span>₹{handlingCharge} </span></p>
                <p className="grand-total">Grand total <span>₹{grandTotal}</span></p>
            </div>

            <div className="cancellation-policy">
                <p><strong>Cancellation Policy</strong></p>
                <p>Orders cannot be cancelled once packed for delivery. In case of unexpected delays, a refund will be provided, if applicable.</p>
            </div>

            <div className="cart-footer">
                <span className="total-amount">₹{grandTotal} TOTAL</span>
                <button className="proceed-button" onClick={handleProceedClick}>
                    Login to Proceed &rarr;
                </button>
            </div>
        </div>
    );
};

export default Cart;