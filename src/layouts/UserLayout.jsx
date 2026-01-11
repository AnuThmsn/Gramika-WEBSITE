import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Cart from '../pages/cart.jsx';
import './UserLayout.css';
import { useNavigate } from 'react-router-dom';

export default function UserLayout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const handleProceedToPayment = (total) => {
    // if user is logged in, go to checkout; otherwise open login
    const token = localStorage.getItem('gramika_token');
    setIsCartOpen(false);
    if (!token) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="user-layout">
      <Header onCartClick={openCart} />
      <main>
        <Outlet />
      </main>

      {/* Cart sidebar (global) */}
      <Cart isOpen={isCartOpen} onClose={closeCart} onProceedToPayment={handleProceedToPayment} />
    </div>
  );
}