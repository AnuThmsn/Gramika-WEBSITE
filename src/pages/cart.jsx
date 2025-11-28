import React, { useState, useEffect } from 'react';
import CartItem from '../components/CartItem.jsx';
import '../styles/Cart.css';
import trialPic from '../assets/trial_pic.jpg';
import { BsClock } from 'react-icons/bs';

const Cart = ({ isOpen, onClose, onProceedToPayment }) => {
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
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    }, [isOpen]);

    const handleProceedClick = () => {
        onProceedToPayment(grandTotal);
    };

    // overlay covers viewport but doesn't remove/hide the background content
    const overlayStyle = {
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        backgroundColor: isOpen ? 'rgba(0,0,0,0.45)' : 'transparent',
        visibility: isOpen ? 'visible' : 'hidden',
        opacity: isOpen ? 1 : 0,
        transition: 'opacity .22s ease, visibility .22s ease, background-color .22s ease',
        pointerEvents: isOpen ? 'auto' : 'none'
    };

    const panelStyle = {
        width: 360,
        maxWidth: '100%',
        height: '100vh',
        background: '#ffffff',
        transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform .28s cubic-bezier(.2,.9,.2,1)',
        boxShadow: '-8px 0 30px rgba(0,0,0,0.25)',
        padding: 20,
        overflowY: 'auto'
    };

    const closeBtnStyle = {
        background: 'transparent',
        border: 'none',
        color: '#204229',
        fontSize: 18,
        cursor: 'pointer',
        fontWeight: 700
    };

    // clicking backdrop (outside the panel) should close cart
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <>
            <div
                className={`cart-overlay ${isOpen ? 'open' : ''}`}
                onClick={handleBackdropClick}
                aria-hidden={!isOpen}
            ></div>

            <div className={`cart-sidebar ${isOpen ? 'open' : ''}`} role="dialog" aria-hidden={!isOpen}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3 style={{ margin: 0, color: '#204229' }}>Your Cart</h3>
                    <button aria-label="Close cart" style={closeBtnStyle} onClick={onClose}>✕</button>
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
        </>
    );
};

export default Cart;