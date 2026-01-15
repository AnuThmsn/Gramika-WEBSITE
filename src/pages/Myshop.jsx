import React, { useState } from 'react';
import '../styles/MyShop.css';
import Dashboard from '../components/dashboard';
import Orders from '../components/order';
import Products from '../components/product';
import Reviews from '../components/review';

const MyShop = () => {
  const [activeSection, setActiveSection] = useState('dashboard');

	// enforce login and seller verification
	React.useEffect(() => {
		const token = localStorage.getItem('gramika_token');
		if (!token) {
			return;
		}
		const sellerStatus = localStorage.getItem('gramika_seller_status');
		if (sellerStatus !== 'verified') {
			// not verified as seller — redirect to profile
			window.location.href = '/profile';
			return;
		}
	}, []);

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'orders':
        return <Orders />;
      case 'products':
        return <Products />;
			case 'reviews':
				return <Reviews sellerId={localStorage.getItem('gramika_user_id')} />;
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
					{/* Reviews are available on the Reviews tab only */}
        </div>
      </div>
    </div>
  );
};

export default MyShop;