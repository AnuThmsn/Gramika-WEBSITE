import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { 
  FaThLarge, 
  FaBoxOpen, 
  FaShoppingCart, 
  FaUsers, 
  FaMoneyBillWave, 
  FaCog, 
  FaSearch, 
  FaUserCircle 
} from 'react-icons/fa';
import './AdminLayout.css';
import logoImg from '../assets/logo.png';

const AdminLayout = () => {
  
  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <FaThLarge /> },
    { name: 'Products', path: '/admin/products', icon: <FaBoxOpen /> },
    { name: 'Orders', path: '/admin/orders', icon: <FaShoppingCart /> },
    { name: 'Users', path: '/admin/users', icon: <FaUsers /> },
    { name: 'Payouts', path: '/admin/payouts', icon: <FaMoneyBillWave /> },
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
            <FaSearch className="search-icon" />
            <input type="text" placeholder="Search..." />
          </div>
          
          <div className="profile-section">
            <span className="admin-name">Anu Thomson</span>
            <Link to="/admin/profile" className="profile-icon-link">
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