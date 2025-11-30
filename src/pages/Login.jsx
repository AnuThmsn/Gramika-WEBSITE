import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../App.css";

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
    if (!isLogin && role === "admin") {
      alert("Admin registration is not allowed.");
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log({ name, email, password, mobile, address, pincode, role, action: isLogin ? "login" : "register" });
    if (role === "admin") navigate("/admin/dashboard");
    else navigate("/profile");
  };

  const inputClass = "form-control ps-5 py-2 rounded-pill shadow-sm";

  return (
    <div className="login-page min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ background: "linear-gradient(to right, #fefcea, #eae3a8ff)" }}>
      <motion.div
        className="card shadow-lg rounded-4 overflow-hidden"
        style={{ maxWidth: "700px", width: "100%", maxHeight: "80vh" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="row g-0">
          {/* Left Image */}
          <div className="col-lg-5 d-none d-lg-flex align-items-center justify-content-center" 
               style={{ 
                 backgroundImage: "url('https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 minHeight: "500px"
               }}>
            <div className="text-center px-3">
              <h1 
                className="fw-bold display-5"
                style={{
                  background: 'linear-gradient(45deg, #f1f0e3ff, #efe5d5ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '2px 2px 6px rgba(246, 232, 140, 0.3)'
                }}
              >
                GRAMIKA
              </h1>
              <p className="mt-3 text-white" style={{ fontSize: '0.95rem', textShadow: '1px 1px 4px rgba(0,0,0,0.3)' }}>
                Connecting local producers with the community
              </p>
            </div>
          </div>

          {/* Right Form */}
          <div className="col-lg-7 p-5 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: "#fff" }}>
            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="fw-bold mb-1" style={{ fontSize: '2rem', letterSpacing: '0.5px' }}>
                {isLogin ? "Sign In" : "Register"}
              </h2>
              <p className="text-muted mb-2" style={{ fontSize: '0.95rem' }}>
                {isLogin ? "Welcome back! Enter your credentials to continue." : "Create your account and start using Gramika."}
              </p>
              <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#4b8f5dff', color: '#000' }}>
                {role === 'admin' ? 'Admin' : 'User'} Account
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="d-flex flex-column align-items-center w-100 gap-3" style={{ maxWidth: "350px", overflowY: "auto" }}>
              {!isLogin && (
                <>
                  <div className="position-relative w-100">
                    <FaUser className="position-absolute" style={{ top: '12px', left: '15px', color: '#ccc' }} />
                    <input type="text" className={inputClass} placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>
                  <div className="position-relative w-100">
                    <FaPhone className="position-absolute" style={{ top: '12px', left: '15px', color: '#ccc' }} />
                    <input type="text" className={inputClass} placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                  </div>
                  <div className="position-relative w-100">
                    <FaMapMarkerAlt className="position-absolute" style={{ top: '12px', left: '15px', color: '#ccc' }} />
                    <input type="text" className={inputClass} placeholder="Complete Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                  </div>
                  <div className="position-relative w-100">
                    <FaMapMarkerAlt className="position-absolute" style={{ top: '12px', left: '15px', color: '#ccc' }} />
                    <input type="text" className={inputClass} placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                  </div>
                </>
              )}

              <div className="position-relative w-100">
                <FaEnvelope className="position-absolute" style={{ top: '12px', left: '15px', color: '#ccc' }} />
                <input type="email" className={inputClass} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="position-relative w-100">
                <FaLock className="position-absolute" style={{ top: '12px', left: '15px', color: '#ccc' }} />
                <input type="password" className={inputClass} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {!isLogin && (
                <div className="position-relative w-100">
                  <FaLock className="position-absolute" style={{ top: '12px', left: '15px', color: '#ccc' }} />
                  <input type="password" className={inputClass} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              )}

              {isLogin && (
                <div className="d-flex justify-content-between align-items-center w-100">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                  </div>
                  <a href="#" className="text-decoration-none" style={{ color: '#4b8f5dff' }}>Forgot password?</a>
                </div>
              )}

              <button type="submit" className="btn fw-bold py-2 rounded-pill px-5" style={{ backgroundColor: '#4b8f5dff', color: '#000', textAlign: 'center' }}>
                {isLogin ? "Sign In" : "Register"}
              </button>

              {!isLogin && (
                <button type="button" className="btn btn-link text-muted mt-2" onClick={() => setIsLogin(true)}>
                  Back to Sign In
                </button>
              )}

              {isLogin && role !== "admin" && (
                <p className="text-center mt-2 mb-0">
                  Don’t have an account?{" "}
                  <button type="button" className="btn btn-link p-0 fw-bold" style={{ color: '#5fb776ff', textDecoration: 'underline' }} onClick={() => setIsLogin(false)}>
                    Register here
                  </button>
                </p>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
