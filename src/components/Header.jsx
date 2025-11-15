import { HiUserCircle } from 'react-icons/hi';
import { BsCart3 } from "react-icons/bs";
import { Link } from 'react-router-dom';
import './Header.css';

function Header({ onCartClick }) {
  return (
    <div className='navbar'>
      <div className="left-group">
        <Link to="/">
          <img className="logo" src="src/assets/logo.png" alt="Logo" />
        </Link>
      </div>
      <div className="nav-links">
        <Link to="/shop">BUY</Link>
        <Link to="/Myshop">MY SHOP</Link>
        <Link to="/about">ABOUT</Link>
      </div>
      <div className="right-group">
        <div className="cart-icon" onClick={onCartClick}>
          <BsCart3 size={32} color="#ffffffff" style={{ padding: '0px 0px 5px 0px' }} /> CART
        </div>
        <div className="profile">
          <Link to="/profile"><HiUserCircle size={49} className="profile-icon" /></Link>
        </div>
      </div>
    </div>
  );
}

export default Header;