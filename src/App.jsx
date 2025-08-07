// src/App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header.jsx';
import Cart from './pages/cart.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import Home from './pages/Home.jsx';

import './pages/Cart.css';
import './components/checkoutModal.css';

function App() {
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
    const [totalForPayment, setTotalForPayment] = useState(0);

    // This function now toggles the cart state and closes the checkout modal for a clean UI
    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
        setIsCheckoutModalOpen(false); // Always close the checkout modal when toggling the cart
    };

    const handleProceedToCheckout = (total) => {
        setTotalForPayment(total);
        setIsCheckoutModalOpen(true);
        setIsCartOpen(false); // Ensures the cart is closed when the modal opens
    };

    const closeCheckoutModal = () => {
        setIsCheckoutModalOpen(false);
    };

    return (
        <Router>
            <div className="App">
                <Header onCartClick={toggleCart} />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<Home />} />
                    </Routes>
                </main>
                <Cart
                    isOpen={isCartOpen}
                    onClose={toggleCart} // Use the improved toggleCart
                    onProceedToPayment={handleProceedToCheckout}
                />
                <CheckoutModal
                    isOpen={isCheckoutModalOpen}
                    onClose={closeCheckoutModal}
                    grandTotal={totalForPayment}
                />
                {isCartOpen && <div className="overlay" onClick={toggleCart}></div>}
            </div>
        </Router>
    );
}

export default App;