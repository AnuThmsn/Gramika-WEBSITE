import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaStar,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import "../styles/Profile.css";

export default function ProfilePage() {
  const navigate = useNavigate();

  // --- User state (example defaults) ---
  const [user, setUser] = useState({
    displayName: "",
    username: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    bio: "",
    joined: "",
    avatarUrl: "",
    applesCollected: 0,
    level: "",
  });

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('gramika_token');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const res = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
  const userData = await res.json();

  if (!userData) {
    console.error('User data is null');
    localStorage.clear();
    navigate('/login');
    return;
  }

  setUser({
    displayName: userData.name || "",
    username: userData.name
      ? userData.name.toLowerCase().replace(/\s+/g, '_')
      : "",
    email: userData.email || "",
    phone: userData.phone || "",
    address: userData.address || "",
    pincode: userData.pincode || "",
    bio: userData.bio || "",
    joined: userData.createdAt
      ? new Date(userData.createdAt).toISOString().split('T')[0]
      : "",
    avatarUrl: userData.avatar || "",
    applesCollected: userData.applesCollected || 0,
    level: userData.level || "Growing Tree",
  });


          // Fetch seller data
          const sellerRes = await fetch('/api/users/seller/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (sellerRes.ok) {
            const sellerData = await sellerRes.json();
            setSellerDetails({
              name: sellerData.name || "",
              email: sellerData.email || "",
              phone: sellerData.phone || "",
              address: sellerData.address || "",
              licenseFileName: sellerData.licenseFileName || "",
              aadharFileName: sellerData.aadharFileName || "",
              sellItems: sellerData.sellItems || [],
            });
            setSellerStatus(sellerData.status || "registered");
          }
        } else {
          // Token invalid, redirect to login
          localStorage.removeItem('gramika_token');
          localStorage.removeItem('gramika_user_id');
          localStorage.removeItem('gramika_is_admin');
          navigate('/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUser();
  }, [navigate]);

  // Load user settings on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('gramika_notifications');
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications));
    }

    const savedPrivacy = localStorage.getItem('gramika_privacy');
    if (savedPrivacy) {
      setPrivacy(JSON.parse(savedPrivacy));
    }
  }, []);

  // seller details (always-visible card: SD1)
  const [sellerDetails, setSellerDetails] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    licenseFileName: "",
    aadharFileName: "",
    sellItems: [],
  });

  // seller status: not_seller | registered | pending | verified
  const [sellerStatus, setSellerStatus] = useState("not_seller");
  const [editingSeller, setEditingSeller] = useState(false);

  // Account settings modals
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);

  // Password change form
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Notifications settings
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false
  });

  // Delete account confirmation
  const [deletePassword, setDeletePassword] = useState('');

  // activity (sample)
  const [activity] = useState([
    { id: 1, text: "Ordered 2 kg of Mangoes", date: "2025-11-01" },
    { id: 2, text: "Posted a recipe: Apple cinnamon buns", date: "2025-10-12" },
    { id: 3, text: "Purchased Coconut Oil from Selvi's Farm", date: "2025-09-30" },
  ]);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const displayedActivity = showAllActivity ? activity : activity.slice(0, 3);

  // compact feedback (left)
  const [quickFeedback, setQuickFeedback] = useState({ rating: 5, comment: "" });

  // computed seller rating (from localStorage reviews)
  const [sellerRating, setSellerRating] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [reviewTarget, setReviewTarget] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // load saved seller details / status from localStorage on mount and fetch sellers
  useEffect(() => {
    const savedSeller = localStorage.getItem("gramika_seller");
    const savedStatus = localStorage.getItem("gramika_seller_status");
    if (savedSeller) {
      const parsed = JSON.parse(savedSeller);
      setSellerDetails({
        name: parsed.name || parsed.shopName || "",
        email: parsed.email || parsed.businessEmail || "",
        phone: parsed.phone || "",
        address: parsed.address || "",
        licenseFileName: parsed.licenseFileName || "",
        aadharFileName: parsed.aadharFileName || "",
        sellItems: parsed.sellItems || [],
      });
      setSellerStatus(savedStatus || "registered");
      computeRating(parsed.name || parsed.shopName);
    }

    // preload sellers list for review dropdown
    (async () => {
      try {
        const res = await fetch('/api/users/sellers');
        if (!res.ok) return;
        const list = await res.json();
        setSellers(list);
      } catch (err) {
        // ignore fetch errors
        console.error('Could not load sellers', err);
      }
    })();
  }, []);

  // compute average rating for a shop
  const computeRating = (shopName) => {
    if (!shopName) {
      setSellerRating(null);
      return;
    }
    const all = JSON.parse(localStorage.getItem("gramika_reviews") || "{}");
    const arr = all[shopName] || [];
    if (!arr.length) {
      setSellerRating(null);
      return;
    }
    const avg = arr.reduce((s, r) => s + r.rating, 0) / arr.length;
    setSellerRating({ avg: Number(avg.toFixed(2)), count: arr.length });
  };

  // --- handlers ---
  const handleSellerInput = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "sellItems") {
      setSellerDetails((prev) => {
        const set = new Set(prev.sellItems);
        if (checked) set.add(value);
        else set.delete(value);
        return { ...prev, sellItems: Array.from(set) };
      });
    } else {
      setSellerDetails((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleLicenseUpload = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setSellerDetails((prev) => ({ ...prev, licenseFileName: f.name }));
    }
  };

  const handleAadharUpload = (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setSellerDetails((prev) => ({ ...prev, aadharFileName: f.name }));
    }
  };

  const saveSellerLocally = (e) => {
    e?.preventDefault();
    // require name & email as minimal
    if (!sellerDetails.name || !sellerDetails.email) {
      alert("Please provide Name and Email.");
      return;
    }
    localStorage.setItem("gramika_seller", JSON.stringify(sellerDetails));
    // if not previously pending/verified, mark as registered
    if (sellerStatus !== "pending" && sellerStatus !== "verified") {
      setSellerStatus("registered");
      localStorage.setItem("gramika_seller_status", "registered");
    } else {
      localStorage.setItem("gramika_seller_status", sellerStatus);
    }
    setEditingSeller(false);
    computeRating(sellerDetails.name);
    // small success feedback
    setTimeout(() => alert("Seller info saved locally."), 10);
    // if logged in, persist seller info to backend seller collection
    const token = localStorage.getItem('gramika_token');
    if (token) {
      const backendSeller = {
        name: sellerDetails.name,
        email: sellerDetails.email,
        phone: sellerDetails.phone,
        address: sellerDetails.address,
        licenseFileName: sellerDetails.licenseFileName,
        aadharFileName: sellerDetails.aadharFileName,
        sellItems: sellerDetails.sellItems,
        status: 'registered'
      };
      fetch('/api/users/seller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(backendSeller)
      }).then(res => {
        if (res.ok) {
          console.log('Seller saved successfully');
        } else {
          console.error('Failed to save seller');
        }
      }).catch(err => console.error('Failed to save seller backend', err));
    }
  };

  const applyForVerification = (e) => {
    e?.preventDefault();
    if (!sellerDetails.name || !sellerDetails.email) {
      alert("Please provide Name and Email before applying.");
      return;
    }
    setSellerStatus("pending");
    localStorage.setItem("gramika_seller", JSON.stringify(sellerDetails));
    localStorage.setItem("gramika_seller_status", "pending");
    setEditingSeller(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    alert("Application sent — status: PENDING.");
    const token = localStorage.getItem('gramika_token');
    if (token) {
      fetch('/api/users/seller/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'pending' })
      }).then(res => {
        if (res.ok) {
          alert('Application sent successfully');
        } else {
          alert('Failed to send application');
        }
      }).catch(err => console.error('Failed to send verification', err));
    }
  };

  const submitReview = async (e) => {
    e?.preventDefault();
    const token = localStorage.getItem('gramika_token');
    if (!token) return alert('Please login to submit a review');
    if (!reviewTarget) return alert('Please select a seller to review');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ seller: reviewTarget, rating: reviewRating, comment: reviewText })
      });
      if (!res.ok) throw new Error('Failed to submit review');
      alert('Review submitted — thank you!');
      setReviewText('');
      setReviewRating(5);
      // notify any review lists to refresh (e.g., seller MyShop reviews)
      try { window.dispatchEvent(new Event('reviewsUpdated')); } catch (e) { /* ignore */ }
    } catch (err) {
      console.error(err);
      alert('Could not submit review');
    }
  };

  const quickFeedbackSubmit = (e) => {
    e.preventDefault();
    // simple client-side action only
    alert("Thanks for the quick feedback!");
    setQuickFeedback({ rating: 5, comment: "" });
  };

  // Account settings functions
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    const token = localStorage.getItem('gramika_token');
    try {
      const res = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Password changed successfully');
        setShowChangePassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert(data.msg || 'Failed to change password');
      }
    } catch (err) {
      console.error(err);
      alert('Error changing password');
    }
  };

  const handleSaveNotifications = () => {
    // Save to localStorage for now
    localStorage.setItem('gramika_notifications', JSON.stringify(notifications));
    alert('Notification preferences saved');
    setShowNotifications(false);
  };

  const handleSavePrivacy = () => {
    // Save to localStorage for now
    localStorage.setItem('gramika_privacy', JSON.stringify(privacy));
    alert('Privacy settings saved');
    setShowPrivacy(false);
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      alert('Please enter your password');
      return;
    }
    const token = localStorage.getItem('gramika_token');
    try {
      const res = await fetch('/api/users/me', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Account deleted successfully');
        localStorage.clear();
        navigate('/login');
      } else {
        alert(data.msg || 'Failed to delete account');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting account');
    }
  };

  const handleRegisterSeller = () => {
    if (!user.displayName) {
      alert('Please wait for your profile data to load.');
      return;
    }
    setSellerDetails({
      name: user.displayName || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      licenseFileName: "",
      aadharFileName: "",
      sellItems: [],
    });
    setEditingSeller(true);
  };

  return (
    <div className="profile-page">
     

      <div className="profile-wrapper">
        {/* COVER + HEADER */}
        <div className="profile-cover">
          <div className="cover-img" />
          <div className="profile-header">
            <div className="avatar-container">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="avatar" className="avatar-img" />
              ) : (
                <FaUserCircle className="avatar-placeholder" />
              )}
            </div>

            <div className="profile-main-info">
              <div className="name-row">
                <h1>{user.displayName || "User"}</h1>
<span className="username">@{user.username || "user"}</span>

              </div>
              <p className="bio">{user.bio}</p>

              
            </div>

            <div className="profile-actions">
  <button className="edit-btn" onClick={() => alert("Edit profile (not implemented)")}>
    <CiEdit /> Edit Profile
  </button>

  {/* Seller Controls moved here */}
  {!sellerDetails.shopName ? (
    <button
      className="register-btn"
      onClick={() => {
        setEditingSeller(true);
        setSellerStatus("not_seller");
      }}
    >
      Register as Seller
    </button>
  ) : (
    <div className="seller-header-controls">
      <button className="edit-seller-btn" onClick={() => setEditingSeller(true)}>
        Edit Seller Info
      </button>

      <div className={`seller-status ${sellerStatus}`}>
        {sellerStatus === "pending"
          ? "Pending"
          : sellerStatus === "verified"
          ? "Verified"
          : "Not Verified"}
      </div>
    </div>
  )}
</div>

          </div>
        </div>

        {/* MAIN GRID: 30% left | 70% right */}
        <div className="profile-grid a2-layout">
          {/* LEFT (30%) compact column */}
          <div className="left-col">
            {/* User Details */}
            <div className="card user-details">
              <h2>User Details</h2>
              <div className="info-list">
                <div className="info-item"><span>Email</span><strong>{user.email}</strong></div>
                <div className="info-item"><span>Phone</span><strong>{user.phone || "Not provided"}</strong></div>
                <div className="info-item"><span>Address</span><strong>{user.address || "Not provided"}</strong></div>
                <div className="info-item"><span>Pincode</span><strong>{user.pincode || "Not provided"}</strong></div>
                <div className="info-item"><span>Joined</span><strong>{user.joined}</strong></div>
                <div className="info-item"><span>Last Active</span><strong>2025-11-15</strong></div>
                <div className="info-item"><span>Account Type</span><strong>User</strong></div>
              </div>

              <h3 className="sub-title">Saved Addresses</h3>
              <div className="address-list">
                <div className="address-item">
                  <FaMapMarkerAlt className="address-icon" />
                  <div className="address-details">
                    <strong>Home</strong>
                    <p>{user.address || "No address provided"}</p>
                    <p>{user.pincode ? `Pincode: ${user.pincode}` : ""}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Feedback (compact) */}
            <div className="card compact-feedback">
              <h3>Quick Feedback</h3>
              <form onSubmit={quickFeedbackSubmit}>
                <div className="rating-stars small">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      className={`star-btn ${quickFeedback.rating >= s ? "active" : ""}`}
                      onClick={() => setQuickFeedback((p) => ({ ...p, rating: s }))}
                      aria-label={`rate ${s}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Short feedback..."
                  value={quickFeedback.comment}
                  onChange={(e) => setQuickFeedback((p) => ({ ...p, comment: e.target.value }))}
                  rows="3"
                />
                <div className="compact-feedback-actions">
                  <button type="submit" className="submit-feedback-btn small">Send</button>
                </div>
              </form>
            </div>

            {/* Account Settings bottom of left */}
            <div className="card settings-card left-settings">
              <h3>Account Settings</h3>
              <div className="settings-options">
                <button onClick={() => setShowChangePassword(true)}>Change Password</button>
                <button onClick={() => setShowNotifications(true)}>Notifications</button>
                <button onClick={() => setShowPrivacy(true)}>Privacy</button>
                <button className="danger" onClick={() => setShowDeleteAccount(true)}>Delete Account</button>
              </div>
            </div>
          </div>

          {/* RIGHT (70%) wide column */}
          <div className="right-col">
            {/* Seller Panel (compact, top) */}
            

            {/* Seller Information Card (always visible per SD1) */}
            <div className="card seller-info-card">
              <h2>Seller Information</h2>
              <p className="seller-intro">Your seller information. Click Edit / Register in the Seller Panel to modify.</p>

              {/* DISPLAY MODE (not editing) */}
              {!editingSeller && (
                <div className="seller-display-grid">
                  <div className="seller-field"><label>Name</label><div className="seller-value">{sellerDetails.name || "—"}</div></div>
                  <div className="seller-field"><label>Email</label><div className="seller-value">{sellerDetails.email || "—"}</div></div>
                  <div className="seller-field"><label>Phone</label><div className="seller-value">{sellerDetails.phone || "—"}</div></div>
                  <div className="seller-field full"><label>Address</label><div className="seller-value">{sellerDetails.address || "—"}</div></div>
                  <div className="seller-field full license-inline">
  <label>License File</label>
  <div className="seller-value">{sellerDetails.licenseFileName || "None"}</div>
</div>
                  <div className="seller-field full license-inline">
  <label>Aadhar File</label>
  <div className="seller-value">{sellerDetails.aadharFileName || "None"}</div>
</div>

                  <div className="seller-actions full">
                    {/* show apply only when we have registration info */}
                    {sellerDetails.name ? (
                      <>
                        <button className="edit-seller-btn" onClick={() => setEditingSeller(true)}>Edit</button>
                        <button
                          className="apply-ver-btn"
                          onClick={applyForVerification}
                          disabled={sellerStatus === "pending" || sellerStatus === "verified"}
                          title={sellerStatus === "pending" ? "Application pending" : ""}
                        >
                          {sellerStatus === "pending" ? "Pending" : sellerStatus === "verified" ? "Verified" : "Apply for Verification"}
                        </button>
                      </>
                    ) : (
                      <button className="register-btn" onClick={handleRegisterSeller}>Register</button>
                    )}
                  </div>
                </div>
              )}

              {/* EDIT MODE: inline form when editingSeller === true */}
              {editingSeller && (
                <form className="seller-edit-form" onSubmit={(e) => { e.preventDefault(); saveSellerLocally(); }}>
                  <div className="form-grid">
                    <div className="form-row"><label>Name</label><input name="name" value={sellerDetails.name} onChange={handleSellerInput} required /></div>
                    <div className="form-row"><label>Email</label><input name="email" value={sellerDetails.email} onChange={handleSellerInput} type="email" required /></div>
                    <div className="form-row"><label>Phone</label><input name="phone" value={sellerDetails.phone} onChange={handleSellerInput} /></div>
                    <div className="form-row full"><label>Address</label><textarea name="address" value={sellerDetails.address} onChange={handleSellerInput} rows="3" /></div>

                    <div className="form-row file-row">
                      <label>Upload License / Document (Optional)</label>
                      <input type="file" onChange={handleLicenseUpload} />
                      <div className="file-name">{sellerDetails.licenseFileName || ""}</div>
                    </div>
                    <div className="form-row file-row">
                      <label>Upload Aadhar for KYC</label>
                      <input type="file" onChange={handleAadharUpload} />
                      <div className="file-name">{sellerDetails.aadharFileName || ""}</div>
                    </div>

                    <div className="form-row full">
                      <label>What do you intend to sell?</label>
                      <div className="checkbox-grid">
                        {["Fruits", "Vegetables", "Snacks", "Handmade Goods", "Other"].map((opt) => (
                          <label className="checkbox-label" key={opt}>
                            <input type="checkbox" name="sellItems" value={opt} checked={sellerDetails.sellItems.includes(opt)} onChange={handleSellerInput} />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => setEditingSeller(false)}>Cancel</button>
                    <button type="button" className="save-btn" onClick={saveSellerLocally}>Save</button>
                    <button type="button" className="apply-ver-btn" onClick={applyForVerification}>Apply for Verification</button>
                  </div>
                </form>
              )}
            </div>

            {/* Success message for verified sellers */}
            {sellerStatus === 'verified' && (
              <div className="card success-card">
                <h3>🎉 Congratulations!</h3>
                <p>Your seller application has been approved by the admin. You are now a verified seller!</p>
                <button className="primary-btn" onClick={() => navigate('/my-shop')}>Go to My Shop</button>
              </div>
            )}

            {/* Activity */}
            <div className="card activity-card">
              <div className="activity-header">
                <h3>Recent ORDERS</h3>
                <span className="muted">Recent</span>
              </div>
              <ul className="activity-list">
                {displayedActivity.map((it) => (
                  <li key={it.id} className="activity-item">
                    <span className="activity-text">{it.text}</span>
                    <small className="activity-date">{it.date}</small>
                  </li>
                ))}
              </ul>

              <div className="activity-actions">
  <button className="outline-btn" onClick={() => navigate("/orders")}>View All Orders</button>

  {activity.length > 3 && (
    <button className="outline-btn" onClick={() => setShowAllActivity(!showAllActivity)}>
      {showAllActivity ? "Show Less" : "Show More"}
    </button>
  )}
</div>

            </div>

            {/* Write a review (select seller) */}
            <div className="card write-review-card" style={{ marginTop: 16 }}>
              <h3>Write a Review</h3>
              <form onSubmit={submitReview}>
                <div style={{ marginBottom: 8 }}>
                  <label>Select Seller</label>
                  <select value={reviewTarget} onChange={(e) => setReviewTarget(e.target.value)} style={{ width: '100%', padding: 8 }}>
                    <option value="">-- choose seller --</option>
                    {sellers.map(s => (
                      <option key={s._id} value={s._id}>{(s.seller && s.seller.shopName) || s.name || s.email}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label>Rating</label>
                  <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} style={{ width: 120, padding: 8 }}>
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n>1?'s':''}</option>)}
                  </select>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <label>Comment</label>
                  <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} rows={3} style={{ width: '100%', padding: 8 }} />
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" onClick={() => { setReviewText(''); setReviewRating(5); setReviewTarget(''); }} className="cancel-btn">Clear</button>
                  <button type="submit" className="save-btn">Submit Review</button>
                </div>
              </form>
            </div>

            {/* Recent Orders summary */}
            
          </div>
        </div>
      </div>

      {/* Account Settings Modals */}
      {showChangePassword && (
        <div className="modal-overlay" onClick={() => setShowChangePassword(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Change Password</h3>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowChangePassword(false)}>Cancel</button>
                <button type="submit">Change Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showNotifications && (
        <div className="modal-overlay" onClick={() => setShowNotifications(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Notification Preferences</h3>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({...notifications, email: e.target.checked})}
                />
                Email notifications
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications({...notifications, push: e.target.checked})}
                />
                Push notifications
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({...notifications, sms: e.target.checked})}
                />
                SMS notifications
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowNotifications(false)}>Cancel</button>
              <button onClick={handleSaveNotifications}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showPrivacy && (
        <div className="modal-overlay" onClick={() => setShowPrivacy(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Privacy Settings</h3>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={privacy.profileVisible}
                  onChange={(e) => setPrivacy({...privacy, profileVisible: e.target.checked})}
                />
                Make profile visible to other users
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={privacy.showEmail}
                  onChange={(e) => setPrivacy({...privacy, showEmail: e.target.checked})}
                />
                Show email address on profile
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={privacy.showPhone}
                  onChange={(e) => setPrivacy({...privacy, showPhone: e.target.checked})}
                />
                Show phone number on profile
              </label>
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowPrivacy(false)}>Cancel</button>
              <button onClick={handleSavePrivacy}>Save</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAccount && (
        <div className="modal-overlay" onClick={() => setShowDeleteAccount(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Account</h3>
            <p>Are you sure you want to delete your account? This action cannot be undone.</p>
            <div className="form-group">
              <label>Enter your password to confirm</label>
              <input
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                required
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowDeleteAccount(false)}>Cancel</button>
              <button className="danger" onClick={handleDeleteAccount}>Delete Account</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
