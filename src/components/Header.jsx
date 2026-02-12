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

  return (
    <div ref={navRef} className='navbar'>
      <div className="left-group">
        <Link to="/">
          <img className="logo" src="src/assets/logo.png" alt="Logo" />
        </Link>
      </div>
      
      <div className="nav-links">
        <Link to="/shop">{translations.BUY}</Link>
        <Link
          to={canAccessMyShop ? "/my-shop" : "#"}
          onClick={e => !canAccessMyShop && e.preventDefault()}
          className={!canAccessMyShop ? "nav-disabled" : ""}
          title={
            !token
              ? "Login required"
              : "Only verified sellers can access My Shop"
          }
        >
          {translations.MY_SHOP}
        </Link>
        <Link to="/">{translations.ABOUT}</Link>
      </div>

      <div className="right-group">
        
        {/* --- CUSTOM MODERN DROPDOWN START --- */}
        <div className="lang-container">
          <button 
            className="lang-btn" 
            onClick={() => setIsLangOpen(!isLangOpen)}
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
        {/* --- CUSTOM DROPDOWN END --- */}

        <div className="cart-icon" onClick={onCartClick}>
          <BsCart3 size={32} style={{ paddingBottom: '5px' }} /> 
          <span style={{marginLeft: '5px'}}>{translations.CART}</span>
        </div>
        
        <div className="profile">
          <Link
  to={isLoggedIn ? "/profile" : "#"}
  onClick={e => !isLoggedIn && e.preventDefault()}
  className={!isLoggedIn ? "nav-disabled" : ""}
  title={!isLoggedIn ? "Login required" : ""}
>
  <HiUserCircle size={49} className="profile-icon" />
</Link>

        </div>
      </div>
    </div>
  );
}

export default Header;