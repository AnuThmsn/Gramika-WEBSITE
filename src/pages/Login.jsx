import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../App.css"; // global styles

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

    // Here you can send data to backend or local storage
    console.log({
      name,
      email,
      password,
      mobile,
      address,
      pincode,
      role,
      action: isLogin ? "login" : "register",
    });

    if (role === "admin") navigate("/admin/dashboard");
    else navigate("/profile");
  };

  return (
    <div className="login-page min-vh-100 d-flex align-items-center justify-content-center" 
         style={{ background: "linear-gradient(to right, #fefcea, #eae3a8ff)" }}>
      <motion.div
        className="card shadow-lg rounded-4 overflow-hidden"
        style={{ maxWidth: "900px", width: "100%" }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="row g-0">
          {/* Left Side - Gradient Text Logo */}
          <div className="col-lg-6 d-none d-lg-flex align-items-center justify-content-center" 
               style={{ 
                 backgroundImage: "url('https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80')",
                 backgroundSize: 'cover',
                 backgroundPosition: 'center',
                 minHeight: "500px"
               }}>
            <div className="text-center px-4">
              <h1 
                className="fw-bold display-4"
                style={{
                  background: 'linear-gradient(45deg, #f1f0e3ff, #efe5d5ff)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '2px 2px 8px rgba(246, 232, 140, 0.4)'
                }}
              >
                GRAMIKA
              </h1>
              <p className="mt-2 text-white" style={{ fontSize: '1rem', textShadow: '1px 1px 4px rgba(0,0,0,0.4)' }}>
                Connecting local producers with the community
              </p>
            </div>
          </div>

          {/* Right Side - Form */}
          <div className="col-lg-6 p-5" style={{ backgroundColor: "#fff" }}>
            <div className="text-center mb-4">
              <h2 className="fw-bold">{isLogin ? "Sign In" : "Register"}</h2>
              <p className="text-muted mb-2">{isLogin ? "Enter your credentials" : "Create your account"}</p>
              <span className="badge rounded-pill px-3 py-2" style={{ backgroundColor: '#f1da36', color: '#000' }}>
                {role === 'admin' ? 'Admin' : 'User'} Account
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              {!isLogin && (
                <>
                  <div className="mb-3 position-relative">
                    <FaUser className="position-absolute" style={{ top: '12px', left: '10px', color: '#ccc' }} />
                    <input type="text" className="form-control ps-5 py-2 rounded-pill" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
                  </div>

                  <div className="mb-3 position-relative">
                    <FaPhone className="position-absolute" style={{ top: '12px', left: '10px', color: '#ccc' }} />
                    <input type="text" className="form-control ps-5 py-2 rounded-pill" placeholder="Mobile Number" value={mobile} onChange={(e) => setMobile(e.target.value)} required />
                  </div>

                  <div className="mb-3 position-relative">
                    <FaMapMarkerAlt className="position-absolute" style={{ top: '12px', left: '10px', color: '#ccc' }} />
                    <input type="text" className="form-control ps-5 py-2 rounded-pill" placeholder="Complete Address" value={address} onChange={(e) => setAddress(e.target.value)} required />
                  </div>

                  <div className="mb-3 position-relative">
                    <FaMapMarkerAlt className="position-absolute" style={{ top: '12px', left: '10px', color: '#ccc' }} />
                    <input type="text" className="form-control ps-5 py-2 rounded-pill" placeholder="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} required />
                  </div>
                </>
              )}

              <div className="mb-3 position-relative">
                <FaEnvelope className="position-absolute" style={{ top: '12px', left: '10px', color: '#ccc' }} />
                <input type="email" className="form-control ps-5 py-2 rounded-pill" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>

              <div className="mb-3 position-relative">
                <FaLock className="position-absolute" style={{ top: '12px', left: '10px', color: '#ccc' }} />
                <input type="password" className="form-control ps-5 py-2 rounded-pill" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>

              {!isLogin && (
                <div className="mb-3 position-relative">
                  <FaLock className="position-absolute" style={{ top: '12px', left: '10px', color: '#ccc' }} />
                  <input type="password" className="form-control ps-5 py-2 rounded-pill" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              )}

              {isLogin && (
                <div className="mb-3 d-flex justify-content-between align-items-center">
                  <div className="form-check">
                    <input type="checkbox" className="form-check-input" id="rememberMe" />
                    <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                  </div>
                  <a href="#" className="text-decoration-none" style={{ color: '#f1da36' }}>Forgot password?</a>
                </div>
              )}

              <button type="submit" className="btn w-100 fw-bold mb-3 rounded-pill" style={{ backgroundColor: '#f1da36', color: '#000' }}>
                {isLogin ? "Sign In" : "Register"}
              </button>

              {/* Only show register option for users */}
              {isLogin && role !== "admin" && (
                <div className="text-center mt-2">
                  <p className="mb-0">
                    Don’t have an account?{" "}
                    <button type="button" className="btn btn-link p-0 fw-bold" style={{ color: '#f1da36', textDecoration: 'underline' }} onClick={() => setIsLogin(false)}>
                      Register here
                    </button>
                  </p>
                </div>
              )}

              {!isLogin && (
                <div className="text-center mt-2">
                  <button type="button" className="btn btn-link text-muted" onClick={() => setIsLogin(true)}>
                    Back to Sign In
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
