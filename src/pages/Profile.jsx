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
    displayName: "Anu Thomson",
    username: "anu_thomson",
    email: "anu@example.com",
    phone: "+91 98765 43210",
    bio: "Maker, gardener & part-time baker — building Gramika 🌱",
    joined: "2024-08-12",
    avatarUrl: "",
    applesCollected: 12,
    level: "Growing Tree",
  });

  // seller details (always-visible card: SD1)
  const [sellerDetails, setSellerDetails] = useState({
    shopName: "",
    category: "",
    businessEmail: "",
    phone: "",
    address: "",
    licenseFileName: "",
    sellItems: [],
  });

  // seller status: not_seller | registered | pending | verified
  const [sellerStatus, setSellerStatus] = useState("not_seller");
  const [editingSeller, setEditingSeller] = useState(false);

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

  // load saved seller details / status from localStorage on mount
  useEffect(() => {
    const savedSeller = localStorage.getItem("gramika_seller");
    const savedStatus = localStorage.getItem("gramika_seller_status");
    if (savedSeller) {
      setSellerDetails(JSON.parse(savedSeller));
      setSellerStatus(savedStatus || "registered");
      computeRating(JSON.parse(savedSeller).shopName);
    }
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

  const saveSellerLocally = (e) => {
    e?.preventDefault();
    // require shopName & businessEmail as minimal
    if (!sellerDetails.shopName || !sellerDetails.businessEmail) {
      alert("Please provide Shop Name and Business Email.");
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
    computeRating(sellerDetails.shopName);
    // small success feedback
    setTimeout(() => alert("Seller info saved locally."), 10);
  };

  const applyForVerification = (e) => {
    e?.preventDefault();
    if (!sellerDetails.shopName || !sellerDetails.businessEmail) {
      alert("Please provide Shop Name and Business Email before applying.");
      return;
    }
    setSellerStatus("pending");
    localStorage.setItem("gramika_seller", JSON.stringify(sellerDetails));
    localStorage.setItem("gramika_seller_status", "pending");
    setEditingSeller(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    alert("Application sent — status: PENDING.");
  };

  const quickFeedbackSubmit = (e) => {
    e.preventDefault();
    // simple client-side action only
    alert("Thanks for the quick feedback!");
    setQuickFeedback({ rating: 5, comment: "" });
  };

  const handleClearSeller = () => {
    localStorage.removeItem("gramika_seller");
    localStorage.removeItem("gramika_seller_status");
    setSellerDetails({
      shopName: "",
      category: "",
      businessEmail: "",
      phone: "",
      address: "",
      licenseFileName: "",
      sellItems: [],
    });
    setSellerStatus("not_seller");
    setSellerRating(null);
    setEditingSeller(false);
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
                <h1>{user.displayName}</h1>
                <span className="username">@{user.username}</span>
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
                <div className="info-item"><span>Phone</span><strong>{user.phone}</strong></div>
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
                    <p>No. 12, Gramika Lane, Green Valley</p>
                    <p>Chennai, Tamil Nadu - 600001</p>
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
                <button onClick={() => alert("Change Password")}>Change Password</button>
                <button onClick={() => alert("Notification Preferences")}>Notifications</button>
                <button onClick={() => alert("Privacy Settings")}>Privacy</button>
                <button className="danger" onClick={() => alert("Delete Account")}>Delete Account</button>
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
                  <div className="seller-field"><label>Shop Name</label><div className="seller-value">{sellerDetails.shopName || "—"}</div></div>
                  <div className="seller-field"><label>Category</label><div className="seller-value">{sellerDetails.category || "—"}</div></div>
                  <div className="seller-field"><label>Business Email</label><div className="seller-value">{sellerDetails.businessEmail || "—"}</div></div>
                  <div className="seller-field"><label>Phone</label><div className="seller-value">{sellerDetails.phone || "—"}</div></div>
                  <div className="seller-field full"><label>Business Address</label><div className="seller-value">{sellerDetails.address || "—"}</div></div>
                  <div className="seller-field full license-inline">
  <label>License File</label>
  <div className="seller-value">{sellerDetails.licenseFileName || "None"}</div>
</div>


                  <div className="seller-field full"><label>Intent to Sell</label><div className="seller-value">{sellerDetails.sellItems.length ? sellerDetails.sellItems.join(", ") : "—"}</div></div>

                  <div className="seller-actions full">
                    {/* show apply only when we have registration info */}
                    {sellerDetails.shopName ? (
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
                      <button className="register-btn" onClick={() => setEditingSeller(true)}>Register</button>
                    )}
                  </div>
                </div>
              )}

              {/* EDIT MODE: inline form when editingSeller === true */}
              {editingSeller && (
                <form className="seller-edit-form" onSubmit={(e) => { e.preventDefault(); saveSellerLocally(); }}>
                  <div className="form-grid">
                    <div className="form-row"><label>Shop Name</label><input name="shopName" value={sellerDetails.shopName} onChange={handleSellerInput} required /></div>
                    <div className="form-row"><label>Category</label><input name="category" value={sellerDetails.category} onChange={handleSellerInput} /></div>
                    <div className="form-row"><label>Business Email</label><input name="businessEmail" value={sellerDetails.businessEmail} onChange={handleSellerInput} type="email" required /></div>
                    <div className="form-row"><label>Phone</label><input name="phone" value={sellerDetails.phone} onChange={handleSellerInput} /></div>
                    <div className="form-row full"><label>Business Address</label><textarea name="address" value={sellerDetails.address} onChange={handleSellerInput} rows="3" /></div>

                    <div className="form-row file-row">
                      <label>Upload License / Document</label>
                      <input type="file" onChange={handleLicenseUpload} />
                      <div className="file-name">{sellerDetails.licenseFileName || ""}</div>
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

            {/* Recent Orders summary */}
            
          </div>
        </div>
      </div>
    </div>
  );
}
