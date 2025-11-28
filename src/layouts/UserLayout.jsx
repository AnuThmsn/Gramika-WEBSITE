import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Cart from '../pages/cart.jsx';
import './UserLayout.css';

export default function UserLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const handleProceedToPayment = (total) => {
    // keep behaviour simple for now — close cart and log total
    setIsCartOpen(false);
    console.log('Proceed to payment:', total);
  };

  return (
    <div className="user-layout">
      <Header onCartClick={openCart} />
      <main style={{ paddingTop: '4.5rem' }}>
        <Outlet />
      </main>

      {/* Cart sidebar (global) */}
      <Cart isOpen={isCartOpen} onClose={closeCart} onProceedToPayment={handleProceedToPayment} />
    </div>
  );
}