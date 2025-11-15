import { useNavigate, NavLink, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { motion } from 'framer-motion';
import { FaLeaf, FaAppleAlt, FaCheese, FaEgg, FaPhone, FaEnvelope, FaMapMarkerAlt, FaUsers, FaHandshake, FaStore, FaShoppingCart, FaTruck, FaUser, FaUserShield } from 'react-icons/fa';
import React, { useState, useRef, useEffect } from 'react';
import "../styles/Home.css";
import Header from '../components/Header'; 
import Cart from './cart.jsx';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Create refs for each section
  const topRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);

  // Cart state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Testimonials state
  const [testimonials, setTestimonials] = useState([
    {
      name: 'Priya Sharma',
      role: 'Local Producer',
      message: "I've been able to sell my extra milk and eggs to neighbors who appreciate fresh, local products."
    },
    {
      name: 'Rahul Patel',
      role: 'Regular Customer',
      message: "The quality of products I get through Gramika is unmatched by any supermarket."
    },
    {
      name: 'Sunita Devi',
      role: 'Vegetable Grower',
      message: "As a small-scale farmer, this platform has helped me reach customers I couldn't find otherwise."
    }
  ]);

  // Scroll to section when location hash changes
  useEffect(() => {
    const scrollToSection = () => {
      const offset = 80; // approximate height of Header in px
      if (location.hash === '#about' && aboutRef.current) {
        const top = aboutRef.current.offsetTop - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      } else if (location.hash === '#contact' && contactRef.current) {
        const top = contactRef.current.offsetTop - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    scrollToSection();
  }, [location]);

  // Handle testimonial submission
  const handleTestimonialSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const newTestimonial = {
      name: form.nameInput.value,
      role: form.roleInput.value,
      message: form.messageInput.value
    };

    setTestimonials([...testimonials, newTestimonial]);
    form.reset();
  };

  // Product data with icons
  const products = [
    {
      name: 'Fresh Vegetables',
      bg: 'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      icon: <FaLeaf className="product-icon" />
    },
    {
      name: 'Seasonal Fruits',
      bg: 'https://images.unsplash.com/photo-1571575173700-afb9492e6a50?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      icon: <FaAppleAlt className="product-icon" />
    },
    {
      name: 'Dairy Products',
      bg: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80',
      icon: <FaCheese className="product-icon" />
    },
    {
      name: 'Farm Fresh Eggs',
      bg: 'https://thumbs.dreamstime.com/b/beautiful-white-sussex-hen-farm-154980883.jpg',
      icon: <FaEgg className="product-icon" />
    }
  ];

  // Animation variants
  const headerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: "beforeChildren"
      }
    }
  };

  const cardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const handleCartClick = () => setIsCartOpen(true);
  const handleCartClose = () => setIsCartOpen(false);

  // Dummy handler for payment
  const handleProceedToPayment = (amount) => {
    alert(`Proceeding to payment of ₹${amount}`);
    setIsCartOpen(false);
  };

  return (
    <div className="community-market min-vh-100 d-flex flex-column" ref={topRef} >
      <Header onCartClick={handleCartClick}/>
      <Cart
        isOpen={isCartOpen}
        onClose={handleCartClose}
        onProceedToPayment={handleProceedToPayment}
      />
      {/* Hero Section */}
      <motion.header
        className="market-header py-4 py-lg-5 text-white"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '60vh'
        }}
        initial="hidden"
        animate="visible"
        variants={headerVariants}
      >
        <div className="container h-100 d-flex flex-column justify-content-center">
          <motion.div
            className="d-flex flex-column align-items-center"
            variants={itemVariants}
            style={{ marginTop: '1em' }} // Add margin-top here
          >
            <motion.div
              className="text-center"
              variants={itemVariants}
            >
              <motion.h1
                className="display-4 display-lg-3 fw-bold mb-2 mb-lg-3"
                style={{ fontFamily: "'Cormorant Garamond', serif" }} // Add this line
                variants={itemVariants}
              >
                GRAMIKA
              </motion.h1>
              <motion.p
                className="lead mb-0 fs-5"
                variants={itemVariants}
              >
                Connecting local producers with their community
              </motion.p>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>

      {/* About Section */}
      <section ref={aboutRef} id="about" className="py-5 bg-light-green">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="community-about-card p-4 p-lg-5 rounded-4 shadow-sm text-center">
                <h2 className="fw-bold mb-4">About Our Community</h2>
                <p className="lead mb-4">
                  Gramika is a platform where local producers can sell their organic products directly to their community.
                  Whether you have extra milk from your cows, fresh eggs from your chickens, or homegrown vegetables,
                  you can connect with neighbors who appreciate fresh, local products.
                </p>

                <div className="row justify-content-center g-4">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="community-feature-icon me-3">
                        <FaUsers className="text-accent-green" size={24} />
                      </div>
                      <span>Join our growing community of local producers</span>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center justify-content-center">
                      <div className="community-feature-icon me-3">
                        <FaHandshake className="text-accent-green" size={24} />
                      </div>
                      <span>Support sustainable local economies</span>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-center gap-3 mt-5">
                  <button
                    className="btn btn-primary-green px-4 py-2"
                    onClick={() => navigate('/login?role=user')}
                  >
                    <FaUser className="me-2" />
                    Sign In as User
                  </button>
                  <button
                    className="btn btn-outline-primary-green px-4 py-2"
                    onClick={() => navigate('/login?role=admin')}
                  >
                    <FaUserShield className="me-2" />
                    Sign In as Admin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <main className="flex-grow-1 py-5 bg-light-cream">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold text-dark-green market-heading display-5">
            <span className="text-accent-green">Local</span> Products Available
          </h2>

          <motion.div
            className="row g-4 justify-content-center"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {products.map((product, index) => (
              <motion.div
                key={index}
                className="col-12 col-sm-6 col-lg-3"
                variants={cardVariants}
              >
                <div
                  className="product-card h-100 rounded-4 overflow-hidden shadow position-relative"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1)), url(${product.bg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    minHeight: '300px'
                  }}
                >
                  <div className="icon-container">
                    {product.icon}
                  </div>
                  <div className="position-absolute bottom-0 start-0 end-0 p-4 text-center"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)'
                    }}>
                    <h3 className="h4 mb-0 text-white fw-bold">{product.name}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      {/* How It Works Section */}
      <section className="py-5 bg-market-secondary">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">How It Works</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="how-it-works-card h-100 p-4 p-lg-5 rounded-4 shadow-sm text-center">
                <div className="step-icon mb-4">
                  <FaStore size={32} />
                </div>
                <h4 className="mb-3">Local Producers List Items</h4>
                <p className="mb-0">
                  Farmers and home producers list their available products with descriptions and prices.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="how-it-works-card h-100 p-4 p-lg-5 rounded-4 shadow-sm text-center">
                <div className="step-icon mb-4">
                  <FaShoppingCart size={32} />
                </div>
                <h4 className="mb-3">Customers Browse & Order</h4>
                <p className="mb-0">
                  Community members browse available products and place orders directly with producers.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="how-it-works-card h-100 p-4 p-lg-5 rounded-4 shadow-sm text-center">
                <div className="step-icon mb-4">
                  <FaTruck size={32} />
                </div>
                <h4 className="mb-3">Pickup or Delivery</h4>
                <p className="mb-0">
                  Products are either picked up at a common location or delivered directly to customers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-5 bg-light-cream">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">What Our Community Says</h2>
          <div className="row">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                className="col-md-4 mb-4"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="testimonial-card h-100 p-4 rounded-4 shadow">
                  <p className="mb-4">"{testimonial.message}"</p>
                  <div className="d-flex align-items-center">
                    <div className="testimonial-avatar rounded-circle me-3 d-flex align-items-center justify-content-center bg-accent-green text-white">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <h6 className="mb-0">{testimonial.name}</h6>
                      <small className="text-muted">{testimonial.role}</small>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section ref={contactRef} id="contact" className="py-5 bg-light-green position-relative overflow-hidden">
        <div className="position-absolute top-0 end-0 w-100 h-100">
          <div className="contact-shape-1"></div>
          <div className="contact-shape-2"></div>
        </div>
        <div className="container position-relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-5"
          >
            <h2 className="fw-bold display-5 mb-3">Get In Touch</h2>
            <p className="lead text-muted mx-auto" style={{ maxWidth: '600px' }}>
              Have questions or feedback? We'd love to hear from you. Reach out to us through any of these channels.
            </p>
          </motion.div>

          <div className="row g-4 justify-content-center">
            <motion.div
              className="col-md-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="contact-card h-100 p-4 p-lg-5 rounded-4 shadow-sm text-center bg-white">
                <div className="contact-icon mb-4">
                  <FaMapMarkerAlt size={32} />
                </div>
                <h4 className="mb-3">Our Location</h4>
                <p className="mb-0 text-muted">
                  123 Community Center<br />
                  Local Town, IN 560001
                </p>
              </div>
            </motion.div>

            <motion.div
              className="col-md-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <div className="contact-card h-100 p-4 p-lg-5 rounded-4 shadow-sm text-center bg-white">
                <div className="contact-icon mb-4">
                  <FaPhone size={32} />
                </div>
                <h4 className="mb-3">Phone</h4>
                <p className="mb-0 text-muted">
                  (123) 456-7890<br />
                  Mon-Fri, 9am-5pm
                </p>
              </div>
            </motion.div>

            <motion.div
              className="col-md-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="contact-card h-100 p-4 p-lg-5 rounded-4 shadow-sm text-center bg-white">
                <div className="contact-icon mb-4">
                  <FaEnvelope size={32} />
                </div>
                <h4 className="mb-3">Email</h4>
                <p className="mb-0 text-muted">
                  hello@gramikacommunity.com<br />
                  We reply within 24 hours
                </p>
              </div>
            </motion.div>
          </div>

          <motion.div
            className="row mt-5 g-4 justify-content-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="col-lg-8">
              <div className="contact-form-card p-4 p-lg-5 rounded-4 shadow-sm bg-white">
                <h3 className="text-center mb-4">Share Your Experience</h3>
                <form onSubmit={handleTestimonialSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="text"
                          className="form-control"
                          id="nameInput"
                          placeholder="Your Name"
                          required
                        />
                        <label htmlFor="nameInput">Your Name</label>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-floating">
                        <input
                          type="email"
                          className="form-control"
                          id="emailInput"
                          placeholder="Your Email"
                          required
                        />
                        <label htmlFor="emailInput">Your Email</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <select
                          className="form-select"
                          id="roleInput"
                          required
                        >
                          <option value="">Select your role</option>
                          <option value="Local Producer">Local Producer</option>
                          <option value="Regular Customer">Regular Customer</option>
                          <option value="Farm Owner">Farm Owner</option>
                          <option value="Community Member">Community Member</option>
                          <option value="Other">Other</option>
                        </select>
                        <label htmlFor="roleInput">I am a...</label>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-floating">
                        <textarea
                          className="form-control"
                          id="messageInput"
                          placeholder="Your Testimonial"
                          style={{ height: '150px' }}
                          required
                        ></textarea>
                        <label htmlFor="messageInput">Your Testimonial</label>
                      </div>
                    </div>
                    <div className="col-12 text-center">
                      <button
                        type="submit"
                        className="btn btn-primary-green px-4 py-3"
                      >
                        Share Your Story
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
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
                <li>
                  <NavLink to="/#top" className="text-white">
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/#about" className="text-white">
                    About
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/#contact" className="text-white">
                    Contact
                  </NavLink>
                </li>
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
    </div>
  );
};

export default Home;