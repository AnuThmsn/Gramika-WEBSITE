// src/components/Footer.jsx
import { NavLink } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary-green py-4 text-white">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4 mb-md-0">
            <h5>Gramika Community</h5>
            <p>Connecting local producers with their neighbors since 2023.</p>
          </div>
          <div className="col-md-4 mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><NavLink to="/#top" className="text-white">Home</NavLink></li>
              <li><NavLink to="/#about" className="text-white">About</NavLink></li>
              <li><NavLink to="/#contact" className="text-white">Contact</NavLink></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Connect With Us</h5>
            <div className="social-links">
              <a href="#" className="text-white me-3"><i className="bi bi-facebook"></i></a>
              <a href="#" className="text-white me-3"><i className="bi bi-instagram"></i></a>
              <a href="#" className="text-white me-3"><i className="bi bi-twitter"></i></a>
            </div>
          </div>
        </div>
        <hr className="my-4" />
        <div className="text-center">
          <p className="mb-0">&copy; {new Date().getFullYear()} Gramika Community. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
