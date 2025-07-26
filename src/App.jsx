// src/App.js
import React, { useState } from 'react';
import Header from './components/Header.jsx';
import Cart from './pages/cart.jsx';
import CheckoutModal from './components/CheckoutModal.jsx'; // Correct component name import

import './pages/Cart.css'; // Cart-specific styles
import './components/checkoutModal.css'; // **CRITICAL: Ensure this is uncommented/present**

function App() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false); // State for the modal
    const [totalForPayment, setTotalForPayment] = useState(0);

    const toggleCart = () => {
        setIsCartOpen(!isCartOpen);
        if (isCheckoutModalOpen) { // Close modal if cart is toggled while modal is open
            setIsCheckoutModalOpen(false);
        }
    };

    const handleProceedToCheckout = (total) => {
        setTotalForPayment(total);
        setIsCheckoutModalOpen(true); // Open the checkout modal
        setIsCartOpen(false); // Close the cart sidebar
    };

    const closeCheckoutModal = () => {
        setIsCheckoutModalOpen(false);
    };

    return (
        <div className="App">
            <Header onCartClick={toggleCart} />
            <main className="main-content">
                
            </main>
            <Cart
                isOpen={isCartOpen}
                onClose={toggleCart}
                onProceedToPayment={handleProceedToCheckout} // Prop name for Cart to trigger modal
            />
            {/* Checkout Modal */}
            <CheckoutModal
                isOpen={isCheckoutModalOpen} // Controls modal visibility
                onClose={closeCheckoutModal}
                grandTotal={totalForPayment}
            />
            {/* Overlay for Cart. CheckoutModal manages its own overlay. */}
            {isCartOpen && <div className="overlay" onClick={toggleCart}></div>}
        </div>
    );
}

export default App;