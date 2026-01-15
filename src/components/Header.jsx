import React, { useState, useRef, useEffect } from 'react'; // 1. Import useState
import { HiUserCircle } from 'react-icons/hi';
import { BsCart3 } from "react-icons/bs";
import { MdLanguage } from "react-icons/md"; // 2. New Globe Icon
import { IoIosArrowDown } from "react-icons/io"; // 3. New Arrow Icon
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Header.css';
const token = localStorage.getItem('gramika_token');
const sellerStatus = localStorage.getItem('gramika_seller_status');

const canAccessMyShop = token && sellerStatus === 'verified';


function Header({ onCartClick }) {
  const { i18n } = useTranslation();
  const [isLangOpen, setIsLangOpen] = useState(false); // State to toggle dropdown
  const navigate = useNavigate();

const isLoggedIn = !!localStorage.getItem('gramika_token');


  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    setIsLangOpen(false); // Close menu after selection
  };

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
        <Link to="/shop">BUY</Link>
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
  MY SHOP
</Link>


        <Link to="/">ABOUT</Link>
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
          {/* Note: Changed color to dark green to match your white theme if needed, or keep white if background is dark */}
          <BsCart3 size={32} style={{ paddingBottom: '5px' }} /> 
          <span style={{marginLeft: '5px'}}>CART</span>
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