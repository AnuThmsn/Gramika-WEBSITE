import React, { useState, useRef, useEffect } from 'react';
import { HiUserCircle } from 'react-icons/hi';
import { BsCart3 } from "react-icons/bs";
import { MdLanguage } from "react-icons/md";
import { IoIosArrowDown } from "react-icons/io";
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { translateBatch } from '../services/translationService';
import './Header.css';

const token = localStorage.getItem('gramika_token');
const sellerStatus = localStorage.getItem('gramika_seller_status');
const canAccessMyShop = token && sellerStatus === 'verified';

function Header({ onCartClick }) {
  const { i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [translations, setTranslations] = useState({
    BUY: 'BUY',
    MY_SHOP: 'MY SHOP',
    ABOUT: 'ABOUT',
    CART: 'CART'
  });
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem('gramika_token');

  // Function to load translations when language changes
  const loadTranslations = async (language) => {
    if (language === 'en') {
      // Reset to English
      setTranslations({
        BUY: 'BUY',
        MY_SHOP: 'MY SHOP',
        ABOUT: 'ABOUT',
        CART: 'CART'
      });
    } else if (language === 'ml') {
      // Translate to Malayalam
      const englishTexts = ['BUY', 'MY SHOP', 'ABOUT', 'CART'];
      const translated = await translateBatch(englishTexts, 'ml');
      setTranslations({
        BUY: translated[0],
        MY_SHOP: translated[1],
        ABOUT: translated[2],
        CART: translated[3]
      });
    }
  };

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    loadTranslations(lang);
    localStorage.setItem('gramika_language', lang);
    setIsLangOpen(false);
  };

  // Load translations on mount from saved preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('gramika_language') || 'en';
    if (savedLanguage !== 'en') {
      loadTranslations(savedLanguage);
    }
  }, []);

  // Helper to show current language label
  const currentLabel = i18n.language === 'ml' ? 'MAL' : 'ENG';

  const navRef = useRef(null);

  useEffect(() => {
    const setNavHeight = () => {
      if (navRef.current) {
        const h = navRef.current.offsetHeight;
        document.documentElement.style.setProperty('--navbar-height', `${h}px`);
      }
    };
    setNavHeight();
    window.addEventListener('resize', setNavHeight);
    return () => window.removeEventListener('resize', setNavHeight);
  }, []);

  // Close mobile menu when navigation happens
  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
  };

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setIsLangOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle cart click - also close mobile menu
  const handleCartClick = () => {
    setIsMobileMenuOpen(false);
    onCartClick();
  };

  return (
    <div ref={navRef} className='navbar'>
      <div className="left-group">
        <Link to="/" onClick={handleNavClick}>
          <img className="logo" src="src/assets/logo.png" alt="Logo" />
        </Link>
      </div>
      
      {/* Desktop Navigation Links */}
      <div className="nav-links">
        <Link to="/shop" onClick={handleNavClick}>{translations.BUY}</Link>
        <Link
          to={canAccessMyShop ? "/my-shop" : "#"}
          onClick={e => {
            handleNavClick();
            if (!canAccessMyShop) e.preventDefault();
          }}
          className={!canAccessMyShop ? "nav-disabled" : ""}
          title={
            !token
              ? "Login required"
              : "Only verified sellers can access My Shop"
          }
        >
          {translations.MY_SHOP}
        </Link>
        <Link to="/" onClick={handleNavClick}>{translations.ABOUT}</Link>
      </div>

      <div className="right-group">
        {/* Language Selector */}
        <div className="lang-container">
          <button 
            className="lang-btn" 
            onClick={() => setIsLangOpen(!isLangOpen)}
            aria-label="Change Language"
          >
            <MdLanguage size={20} /> 
            <span className="lang-text">{currentLabel}</span>
            <IoIosArrowDown className={`arrow-icon ${isLangOpen ? 'rotate' : ''}`} />
          </button>

          {isLangOpen && (
            <div className="lang-dropdown">
              <div 
                className={`lang-option ${i18n.language === 'en' ? 'active' : ''}`} 
                onClick={() => changeLanguage('en')}
              >
                English
              </div>
              <div 
                className={`lang-option ${i18n.language === 'ml' ? 'active' : ''}`} 
                onClick={() => changeLanguage('ml')}
              >
                മലയാളം
              </div>
            </div>
          )}
        </div>

        {/* Cart Icon */}
        <div className="cart-icon" onClick={handleCartClick} title="Open Cart">
          <BsCart3 size={32} /> 
          <span>{translations.CART}</span>
        </div>
        
        {/* Profile Icon */}
        <div className="profile">
          <Link
            to={isLoggedIn ? "/profile" : "#"}
            onClick={e => {
              handleNavClick();
              if (!isLoggedIn) e.preventDefault();
            }}
            className={!isLoggedIn ? "nav-disabled" : ""}
            title={!isLoggedIn ? "Login required" : "Open Profile"}
          >
            <HiUserCircle className="profile-icon" />
          </Link>
        </div>

        {/* Hamburger Menu Button (Mobile) */}
        <button 
          className={`hamburger-menu ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
        <Link to="/shop" className="mobile-menu-item" onClick={handleNavClick}>
          {translations.BUY}
        </Link>
        <Link
          to={canAccessMyShop ? "/my-shop" : "#"}
          className={`mobile-menu-item ${!canAccessMyShop ? "disabled" : ""}`}
          onClick={e => {
            handleNavClick();
            if (!canAccessMyShop) e.preventDefault();
          }}
          title={
            !token
              ? "Login required"
              : "Only verified sellers can access My Shop"
          }
        >
          {translations.MY_SHOP}
        </Link>
        <Link to="/" className="mobile-menu-item" onClick={handleNavClick}>
          {translations.ABOUT}
        </Link>
      </div>
    </div>
  );
}

export default Header;