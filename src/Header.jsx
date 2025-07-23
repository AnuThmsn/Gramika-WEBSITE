import { HiUserCircle } from 'react-icons/hi';
import { BsCart3 } from "react-icons/bs";
import './Header.css';

function Header() {
  return (
    <>
      <div className='navbar'>
        <div className="left-group">
          <img className="logo" src="src/assets/gramika.png" alt="Logo" />
        </div>
        <div className="nav-links">
          <a href="#buy">SHOP</a>
          <a href="#sell">SELL</a>
          <a href="#orders">ORDERS</a>
          <a href="#about">ABOUT</a>
        </div>
        <div className="right-group">
          <div className="cart-icon">
            <BsCart3 size={32} color="#5b5b5aff" style={{ padding: '0px 0px 5px 0px' }} /> CART
          </div>
          <div className="profile">
            <HiUserCircle size={49} className="profile-icon" />
          </div>
          
        </div>
      </div>
    </>
  );
}

export default Header;