import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css'; 
import "../styles/Login.css"; 

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const role = new URLSearchParams(location.search).get("role") || "user";

  const handleSubmit = (e) => {
    e.preventDefault();

    (async () => {
      try {
        if (!isLogin && role === "admin") {
          alert("Admin registration is not allowed.");
          return;
        }

        if (!isLogin && password !== confirmPassword) {
          alert("Passwords do not match!");
          return;
        }

        if (isLogin) {
          /* ================= LOGIN ================= */
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
          });

          const data = await res.json();
          if (!res.ok) return alert(data.msg || 'Login failed');

          localStorage.setItem('gramika_token', data.token);
          localStorage.setItem('gramika_user_id', data.user.id);
          localStorage.setItem('gramika_is_admin', data.user.isAdmin);

          // 🔥 ONLY CHANGE: ROLE-BASED REDIRECT
          if (data.user.isAdmin) {
            navigate('/admin/dashboard');   // loads AdminLayout
          } else {
            navigate('/profile');           // normal user
          }

        } else {
          /* ================= REGISTER (USER ONLY) ================= */
          const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone: mobile, address, pincode })
          });

          const data = await res.json();
          if (!res.ok) return alert(data.msg || 'Registration failed');

          localStorage.setItem('gramika_token', data.token);
          localStorage.setItem('gramika_user_id', data.user.id);
          localStorage.setItem('gramika_is_admin', 'false');

          navigate('/profile');
        }

      } catch (err) {
        console.error(err);
        alert('Authentication error');
      }
    })();
  };

  return (
    <div className="login-page">
      <motion.div
        className="login-card"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="login-row">

          {/* LEFT IMAGE */}
          <div 
            className="image-side"
            style={{ 
              backgroundImage: "url('https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')"
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(15, 61, 30, 0.3), rgba(15, 61, 30, 0.7))' }}></div>
            <div className="text-center px-4 position-relative z-1">
              <h1 className="brand-title">GRAMIKA</h1>
              <p className="brand-subtitle mt-2">
                Connecting local producers with the community
              </p>
            </div>
          </div>

          {/* RIGHT FORM */}
          <div className="form-side">
            <div className="text-center login-header">
              <h2>{isLogin ? "Welcome Back" : "Join Gramika"}</h2>
            </div>

            <form onSubmit={handleSubmit} className="d-flex flex-column w-100 gap-2" style={{ maxWidth: "320px" }}>
              
              {!isLogin && (
                <>
                  <div className="custom-input-group">
                    <FaUser className="input-icon" />
                    <input type="text" className="custom-input" placeholder="Full Name"
                      value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="custom-input-group">
                    <FaPhone className="input-icon" />
                    <input type="text" className="custom-input" placeholder="Mobile Number"
                      value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                  </div>

                  <div className="row g-2">
                    <div className="col-8 custom-input-group">
                      <FaMapMarkerAlt className="input-icon" />
                      <input type="text" className="custom-input" placeholder="Address"
                        value={address} onChange={(e) => setAddress(e.target.value)} required />
                    </div>
                    <div className="col-4">
                      <input type="text" className="custom-input ps-3 text-center" placeholder="Pin"
                        value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                    </div>
                  </div>
                </>
              )}

              <div className="custom-input-group">
                <FaEnvelope className="input-icon" />
                <input type="email" className="custom-input" placeholder="Email Address"
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="custom-input-group">
                <FaLock className="input-icon" />
                <input type="password" className="custom-input" placeholder="Password"
                  value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {!isLogin && (
                <div className="custom-input-group">
                  <FaLock className="input-icon" />
                  <input type="password" className="custom-input" placeholder="Confirm Password"
                    value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              )}

              <button type="submit" className="btn-gramika shadow-sm">
                {isLogin ? "Sign In" : "Create Account"}
              </button>

              <div className="text-center mt-2">
                <p className="text-muted mb-1" style={{ fontSize: '0.9rem' }}>
                  {isLogin ? "New to Gramika?" : "Already have an account?"}
                </p>
                <button
                  type="button"
                  className="btn btn-link p-0 link-gramika"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? "Register Here" : "Sign In"}
                </button>
              </div>

            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
