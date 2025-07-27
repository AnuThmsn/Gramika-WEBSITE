// src/pages/Login.js
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaUser, FaUserShield } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get('role') || 'user';

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle authentication logic here
    console.log({
      email,
      password,
      name,
      role
    });
    navigate('/');
  };

  return (
    <div className="login-page min-vh-100 d-flex align-items-center" style={{ backgroundColor: '#b9e7a5' }}>
      <div className="container">
        <motion.div 
          className="row justify-content-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="col-lg-8">
            <div className="d-flex flex-column flex-lg-row auth-container rounded-4 overflow-hidden shadow">
              {/* Left Section - Logo */}
              <div 
                className="logo-section d-none d-lg-flex align-items-center justify-content-center p-5"
                style={{ 
                  backgroundColor: '#fffde7',
                  backgroundImage: "url('https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  flex: 1
                }}
              >
                <div className="text-center">
                  <img 
                    src="/gramika.png" 
                    alt="Gramika Logo" 
                    className="img-fluid mb-3"
                    style={{ 
                      maxWidth: '200px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                  />
                  <h3 className="text-dark fw-bold">GRAMIKA</h3>
                  <p className="text-muted">Connecting local producers</p>
                </div>
              </div>

              {/* Right Section - Form */}
              <div 
                className="auth-form p-4 p-lg-5"
                style={{ 
                  backgroundColor: '#fffde7',
                  flex: 1
                }}
              >
                <div className="text-center mb-4">
                  <h2 className="fw-bold">{isLogin ? 'Sign In' : 'Register'}</h2>
                  <p className="text-muted">
                    {isLogin ? 'Sign in to access your account' : 'Create a new account to get started'}
                  </p>
                </div>

                <div className="role-indicator mb-4 text-center">
                  <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#f9c600', color: '#000' }}>
                    {role === 'admin' ? 'Admin' : 'User'} Account
                  </span>
                </div>

                <form onSubmit={handleSubmit}>
                  {!isLogin && (
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {!isLogin && (
                    <div className="mb-3">
                      <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                      <input
                        type="password"
                        className="form-control"
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  {isLogin && (
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                      <div className="form-check">
                        <input type="checkbox" className="form-check-input" id="rememberMe" />
                        <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                      </div>
                      <a href="#" className="text-decoration-none" style={{ color: '#f9c600' }}>Forgot password?</a>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn w-100 py-2 fw-bold mb-3"
                    style={{ backgroundColor: '#f9c600', color: '#000' }}
                  >
                    {isLogin ? 'Sign In' : 'Register'}
                  </button>

                  <div className="text-center">
                    <p className="mb-0">
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                      <button
                        type="button"
                        className="btn btn-link p-0 ms-2"
                        style={{ color: '#f9c600' }}
                        onClick={() => setIsLogin(!isLogin)}
                      >
                        {isLogin ? 'Register here' : 'Sign in here'}
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;