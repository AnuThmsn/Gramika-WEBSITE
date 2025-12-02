import React, { useState } from 'react';
import '../styles/MyShop.css';
import Dashboard from '../components/dashboard';
import Orders from '../components/order';
import Products from '../components/product';
import Reviews from '../components/review';

const MyShop = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <Orders />;
      case 'products':
        return <Products />;
      case 'reviews':
        return <Reviews />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="myshop-page-container">
      <div className="myshop-main-content-area">
        <aside className="myshop-sidebar">
          <h2 className="myshop-sidebar-title">My Shop</h2>
          <nav className="myshop-sidebar-nav">
            <button
              className={`myshop-nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              Dashboard
            </button>
            <button
              className={`myshop-nav-item ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveSection('orders')}
            >
              Orders
            </button>
            <button
              className={`myshop-nav-item ${activeSection === 'products' ? 'active' : ''}`}
              onClick={() => setActiveSection('products')}
            >
              Products
            </button>
            <button
              className={`myshop-nav-item ${activeSection === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveSection('reviews')}
            >
              Reviews
            </button>
          </nav>
        </aside>

        <div className="myshop-content">
          <div className="page-inner">{renderContent()}</div>
        </div>
      </div>
    </div>
  );
};

export default MyShop;