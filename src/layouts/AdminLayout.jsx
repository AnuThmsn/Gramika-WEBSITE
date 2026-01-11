import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { 
  FaThLarge, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaUsers, 
  FaCog, 
  FaSearch, 
  FaUserCircle 
} from 'react-icons/fa';
import './AdminLayout.css';
import logoImg from '../assets/logo.png';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    const q = (searchValue || '').trim();
    if (!q) return;
    const l = q.toLowerCase();

    // simple routing heuristics
    if (l.includes('product') || l.startsWith('p:') || /sku|item|price|category/.test(l)) {
      navigate(`/admin/products?q=${encodeURIComponent(q)}`);
    } else if (l.includes('order') || l.startsWith('o:') || /invoice|order#|trx|buyer|seller/.test(l)) {
      navigate(`/admin/orders?q=${encodeURIComponent(q)}`);
    } else if (l.includes('user') || l.includes('buyer') || l.includes('seller')) {
      navigate(`/admin/users?q=${encodeURIComponent(q)}`);
    } else if (l.includes('payout') || l.includes('pay')) {
      navigate(`/admin/payouts?q=${encodeURIComponent(q)}`);
    } else {
      // fallback to dashboard (showing results there)
      navigate(`/admin/dashboard?q=${encodeURIComponent(q)}`);
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FaThLarge /> },
    { name: 'Products', path: '/admin/products', icon: <FaBoxOpen /> },
    { name: 'Orders', path: '/admin/orders', icon: <FaShoppingCart /> },
    { name: 'Users', path: '/admin/users', icon: <FaUsers /> },
  ];

  return (
    <div className="admin-container">
      
      {/* 1. TOP NAVBAR (Full Width) */}
      <header className="top-navbar">
        
        {/* Left: LOGO */}
        <div className="navbar-brand">
          <img src={logoImg} alt="Gramika" className="navbar-logo" />
        </div>

        {/* Right: Search & Profile */}
        <div className="nav-right">
          <div className="search-box">
            <FaSearch className="search-icon" onClick={handleSearchSubmit} />
            <form onSubmit={handleSearchSubmit} style={{ display: 'inline' }}>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search..."
              />
            </form>
          </div>
          
          <div className="profile-section">
            <span className="admin-name">Anu Thomson</span>
            <Link to="/admin/settings" className="profile-icon-link">
              <FaUserCircle size={32} />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. BODY LAYOUT (Sidebar + Content) */}
      <div className="layout-body">
        
        {/* SIDEBAR (Starts below header) */}
        <aside className="admin-sidebar">
          <nav className="sidebar-nav">
            {menuItems.map((item) => (
              <NavLink 
                key={item.name} 
                to={item.path} 
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
              >
                <span className="icon">{item.icon}</span>
                <span className="label">{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <NavLink 
              to="/admin/settings" 
              className={({ isActive }) => isActive ? "nav-item active settings" : "nav-item settings"}
            >
              <span className="icon"><FaCog /></span>
              <span className="label">Settings</span>
            </NavLink>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="content-area">
          <Outlet />
        </main>
      </div>

    </div>
  );
};

export default AdminLayout;