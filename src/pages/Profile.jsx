import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserCircle,
  FaMapMarkerAlt,
  FaStar,
  FaChevronDown,
  FaChevronUp,
  FaUpload,
} from "react-icons/fa";
import { CiEdit } from "react-icons/ci";
import "../styles/Profile.css";

export default function ProfilePage() {
  const navigate = useNavigate();

  // Category options as checkboxes
  const CATEGORY_OPTIONS = [
    "Fruits",
    "Vegetables",
    "Dairy",
    "Bakery",
    "Snacks",
    "Handmade Goods",
    "Grains & Pulses",
    "Spices & Condiments",
    "Beverages",
    "Other"
  ];

  // Main user state with integrated seller fields
  const [user, setUser] = useState({
    _id: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    pincode: "",
    bio: "",
    createdAt: "",
    avatar: "",
    isAdmin: false,
    isSeller: false,
    seller: {
      shopName: "",
      category: [],
      businessEmail: "",
      phone: "",
      address: "",
      licenseFileName: "",
      aadharFileName: "",
      status: "not_seller"
    }
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
          console.log('Fetched user data:', userData); // Debug log
          
          // Ensure category is an array
          const sellerCategory = Array.isArray(userData.seller?.category) 
            ? userData.seller.category 
            : userData.seller?.category 
              ? [userData.seller.category] 
              : [];
          
          // Persist auth & seller info in localStorage
          localStorage.setItem('gramika_user_id', userData._id);
          localStorage.setItem('gramika_is_admin', String(userData.isAdmin || false));
          localStorage.setItem('gramika_is_seller', String(userData.isSeller || false));
          
          // Normalize seller status from single user model
          const sellerStatus = userData.seller?.status || 'not_seller';
          localStorage.setItem('gramika_seller_status', sellerStatus);
          
          // Set complete user state with seller fields - ensure all fields exist
          setUser({
            _id: userData._id || "",
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            pincode: userData.pincode || "",
            bio: userData.bio || "",
            createdAt: userData.createdAt || "",
            avatar: userData.avatar || "",
            isAdmin: userData.isAdmin || false,
            isSeller: userData.isSeller || false,
            seller: {
              shopName: userData.seller?.shopName || "",
              category: sellerCategory,
              businessEmail: userData.seller?.businessEmail || "",
              phone: userData.seller?.phone || "",
              address: userData.seller?.address || "",
              licenseFileName: userData.seller?.licenseFileName || "",
              aadharFileName: userData.seller?.aadharFileName || "",
              status: userData.seller?.status || "not_seller"
            }
          });

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

  // UI states
  const [editingSeller, setEditingSeller] = useState(false);
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const [uploadingAadhar, setUploadingAadhar] = useState(false);
  
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

  // Activity (sample)
  const [activity] = useState([
    { id: 1, text: "Ordered 2 kg of Mangoes", date: "2025-11-01" },
    { id: 2, text: "Posted a recipe: Apple cinnamon buns", date: "2025-10-12" },
    { id: 3, text: "Purchased Coconut Oil from Selvi's Farm", date: "2025-09-30" },
  ]);
  const [showAllActivity, setShowAllActivity] = useState(false);
  const displayedActivity = showAllActivity ? activity : activity.slice(0, 3);

  // Quick feedback
  const [quickFeedback, setQuickFeedback] = useState({ rating: 5, comment: "" });

  // Seller rating and review states
  const [sellerRating, setSellerRating] = useState(null);
  const [sellers, setSellers] = useState([]);
  const [reviewTarget, setReviewTarget] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  // Load saved seller details and fetch sellers
  useEffect(() => {
    // Compute rating for current user if they are a seller
    if (user.seller?.shopName) {
      computeRating(user.seller.shopName);
    }

    // Preload sellers list for review dropdown
    (async () => {
      try {
        const res = await fetch('/api/users/sellers');
        if (!res.ok) return;
        const list = await res.json();
        setSellers(list);
      } catch (err) {
        console.error('Could not load sellers', err);
      }
    })();
  }, [user.seller?.shopName]);

  // Compute average rating for a shop
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

  // --- Handlers ---
  const handleSellerInput = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith("seller.")) {
      const field = name.split(".")[1];
      setUser(prev => ({
        ...prev,
        seller: {
          ...prev.seller,
          [field]: value
        }
      }));
    } else {
      setUser(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCategoryChange = (category) => {
    setUser(prev => {
      const currentCategories = prev.seller.category || [];
      const newCategories = currentCategories.includes(category)
        ? currentCategories.filter(c => c !== category)
        : [...currentCategories, category];
      
      return {
        ...prev,
        seller: {
          ...prev.seller,
          category: newCategories
        }
      };
    });
  };

  const handleSellerFieldChange = (field, value) => {
    setUser(prev => ({
      ...prev,
      seller: {
        ...prev.seller,
        [field]: value
      }
    }));
  };

  const handleLicenseUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    setUploadingLicense(true);
    const formData = new FormData();
    formData.append('license', file);
    
    const token = localStorage.getItem('gramika_token');
    try {
      const res = await fetch('/api/users/me/seller/license', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      console.log('License upload response:', data); // Debug log
      
      if (res.ok) {
        handleSellerFieldChange('licenseFileName', data.fileName || file.name);
        alert("License uploaded successfully!");
        
        // Also update the user data in the backend
        await updateSellerInfo();
      } else {
        alert(data.message || data.msg || "Failed to upload license file");
      }
    } catch (error) {
      console.error('Error uploading license:', error);
      alert("Error uploading license file. Please try again.");
    } finally {
      setUploadingLicense(false);
    }
  };

  const handleAadharUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    
    setUploadingAadhar(true);
    const formData = new FormData();
    formData.append('aadhar', file);
    
    const token = localStorage.getItem('gramika_token');
    try {
      const res = await fetch('/api/users/me/seller/aadhar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await res.json();
      console.log('Aadhar upload response:', data); // Debug log
      
      if (res.ok) {
        handleSellerFieldChange('aadharFileName', data.fileName || file.name);
        alert("Aadhar uploaded successfully!");
        
        // Also update the user data in the backend
        await updateSellerInfo();
      } else {
        alert(data.message || data.msg || "Failed to upload Aadhar file");
      }
    } catch (error) {
      console.error('Error uploading Aadhar:', error);
      alert("Error uploading Aadhar file. Please try again.");
    } finally {
      setUploadingAadhar(false);
    }
  };

  // Helper function to update seller info after file upload
  const updateSellerInfo = async () => {
    const token = localStorage.getItem('gramika_token');
    try {
      const res = await fetch('/api/users/me/seller', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        // send seller object directly (backend expects seller fields at root)
        body: JSON.stringify(user.seller)
      });
      
      if (res.ok) {
        console.log('Seller info updated after file upload');
      }
    } catch (error) {
      console.error('Error updating seller info:', error);
    }
  };

  // Derive a user-friendly filename from stored GridFS filename
  const getDisplayFilename = (storedName) => {
    if (!storedName) return '';
    // storedName format: <userId>_aadhar|license_<timestamp>_<originalname>
    return storedName.replace(/^.*?_(?:aadhar|license)_[0-9]+_/, '');
  };

  const saveSellerInfo = async (e) => {
    e?.preventDefault();
    
    // Validate required fields
    if (!user.seller.shopName) {
      alert("Please provide Shop Name.");
      return;
    }
    
    if (!user.seller.businessEmail) {
      alert("Please provide Business Email.");
      return;
    }
    
    const token = localStorage.getItem('gramika_token');
    try {
      const res = await fetch('/api/users/me/seller', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          seller: {
            ...user.seller,
            status: user.seller.status === 'not_seller' ? 'registered' : user.seller.status
          },
          isSeller: true
        })
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        console.log('Seller info saved:', updatedUser); // Debug log
        setUser(updatedUser);
        localStorage.setItem('gramika_is_seller', 'true');
        localStorage.setItem('gramika_seller_status', updatedUser.seller?.status || 'registered');
        
        setEditingSeller(false);
        alert("Seller information saved successfully!");
      } else {
        const errorData = await res.json();
        console.error('Save seller error:', errorData);
        alert(errorData.message || errorData.msg || "Failed to save seller information");
      }
    } catch (error) {
      console.error('Error saving seller info:', error);
      alert("Error saving seller information");
    }
  };

  const applyForVerification = async (e) => {
    e?.preventDefault();
    
    if (!user.seller.shopName) {
      alert("Please provide Shop Name before applying.");
      return;
    }
    
    if (!user.seller.licenseFileName || !user.seller.aadharFileName) {
      alert("Please upload both License and Aadhar files before applying for verification.");
      return;
    }
    
    const token = localStorage.getItem('gramika_token');
    try {
      const res = await fetch('/api/users/me/seller/apply', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'pending' })
      });
      
      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('gramika_seller_status', 'pending');
        
        setEditingSeller(false);
        alert("Application sent — status: PENDING.");
      } else {
        const error = await res.json();
        alert(error.message || error.msg || "Failed to submit application");
      }
    } catch (error) {
      console.error('Error applying for verification:', error);
      alert("Error submitting application");
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
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          seller: reviewTarget, 
          rating: reviewRating, 
          comment: reviewText 
        })
      });
      
      if (!res.ok) throw new Error('Failed to submit review');
      alert('Review submitted — thank you!');
      setReviewText('');
      setReviewRating(5);
      setReviewTarget('');
      
      // Notify any review lists to refresh
      try { 
        window.dispatchEvent(new Event('reviewsUpdated')); 
      } catch (e) { /* ignore */ }
    } catch (err) {
      console.error(err);
      alert('Could not submit review');
    }
  };

  const quickFeedbackSubmit = (e) => {
    e.preventDefault();
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
          'Authorization': `Bearer ${token}`
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
        alert(data.msg || data.message || 'Failed to change password');
      }
    } catch (err) {
      console.error(err);
      alert('Error changing password');
    }
  };

  const handleSaveNotifications = () => {
    localStorage.setItem('gramika_notifications', JSON.stringify(notifications));
    alert('Notification preferences saved');
    setShowNotifications(false);
  };

  const handleSavePrivacy = () => {
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
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: deletePassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        alert('Account deleted successfully');
        localStorage.clear();
        navigate('/login');
      } else {
        alert(data.msg || data.message || 'Failed to delete account');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting account');
    }
  };

  const handleRegisterSeller = () => {
    // Pre-fill seller info with user info if available
    const initialSellerData = {
      shopName: "",
      category: [],
      businessEmail: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
      licenseFileName: "",
      aadharFileName: "",
      status: "registered"
    };
    
    setUser(prev => ({
      ...prev,
      seller: initialSellerData,
      isSeller: true
    }));
    
    setEditingSeller(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="profile-page">
      <div className="profile-wrapper">
        {/* COVER + HEADER */}
        <div className="profile-cover">
          <div className="cover-img" />
          <div className="profile-header">
            <div className="avatar-container">
              {user.avatar ? (
                <img src={user.avatar} alt="avatar" className="avatar-img" />
              ) : (
                <FaUserCircle className="avatar-placeholder" />
              )}
            </div>

            <div className="profile-main-info">
              <div className="name-row">
                <h1>{user.name || "User"}</h1>
                <span className="username">@{user.name ? user.name.toLowerCase().replace(/\s+/g, '_') : "user"}</span>
              </div>
              <p className="bio">{user.bio}</p>
            </div>

            <div className="profile-actions">
              <button className="edit-btn" onClick={() => alert("Edit profile (not implemented)")}>
                <CiEdit /> Edit Profile
              </button>

              {/* Seller Controls */}
              {!user.isSeller ? (
                <button
                  className="register-btn"
                  onClick={handleRegisterSeller}
                >
                  Register as Seller
                </button>
              ) : (
                <div className="seller-header-controls">
                  <button className="edit-seller-btn" onClick={() => setEditingSeller(true)}>
                    Edit Seller Info
                  </button>

                  <div className={`seller-status ${user.seller.status}`}>
                    {user.seller.status === "pending"
                      ? "Pending"
                      : user.seller.status === "verified"
                      ? "Verified"
                      : "Registered"}
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
                <div className="info-item"><span>Joined</span><strong>{formatDate(user.createdAt)}</strong></div>
                <div className="info-item">
                  <span>Account Type</span>
                  <strong>
                    {user.isAdmin ? "Admin" : user.isSeller ? "Seller" : "User"}
                  </strong>
                </div>
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
            {/* Seller Information Card */}
            <div className="card seller-info-card">
              <h2>Seller Information</h2>
              <p className="seller-intro">
                {user.isSeller 
                  ? "Your seller information. Click Edit to modify." 
                  : "Register as a seller to start selling your products."}
              </p>

              {/* DISPLAY MODE (not editing) */}
              {!editingSeller && (
                <div className="seller-display-grid">
                  <div className="seller-field"><label>Shop Name</label><div className="seller-value">{user.seller?.shopName || "—"}</div></div>
                  <div className="seller-field"><label>Business Email</label><div className="seller-value">{user.seller?.businessEmail || "—"}</div></div>
                  <div className="seller-field"><label>Phone</label><div className="seller-value">{user.seller?.phone || "—"}</div></div>
                  <div className="seller-field full">
                    <label>Categories</label>
                    <div className="seller-value categories-display">
                      {user.seller?.category && user.seller.category.length > 0 
                        ? user.seller.category.join(", ")
                        : "—"}
                    </div>
                  </div>
                  <div className="seller-field full"><label>Business Address</label><div className="seller-value">{user.seller?.address || "—"}</div></div>
                  <div className="seller-field full license-inline">
                    <label>License File</label>
                    <div className="seller-value file-display">
                      {user.seller?.licenseFileName ? (
                        <>
                          <span className="file-name">{getDisplayFilename(user.seller.licenseFileName)}</span>
                          <span className="file-status uploaded">Uploaded</span>
                        </>
                      ) : (
                        <span className="file-status missing">Not uploaded</span>
                      )}
                    </div>
                  </div>
                  <div className="seller-field full license-inline">
                    <label>Aadhar File</label>
                    <div className="seller-value file-display">
                      {user.seller?.aadharFileName ? (
                        <>
                          <span className="file-name">{getDisplayFilename(user.seller.aadharFileName)}</span>
                          <span className="file-status uploaded">Uploaded</span>
                        </>
                      ) : (
                        <span className="file-status missing">Not uploaded</span>
                      )}
                    </div>
                  </div>
                  <div className="seller-field"><label>Status</label>
                    <div className={`status-badge ${user.seller?.status || 'not_seller'}`}>
                      {user.seller?.status === 'not_seller' ? 'Not Registered' : 
                       user.seller?.status === 'registered' ? 'Registered' :
                       user.seller?.status === 'pending' ? 'Pending Verification' : 'Verified'}
                    </div>
                  </div>

                  <div className="seller-actions full">
                    {user.isSeller ? (
                      <>
                        <button className="edit-seller-btn" onClick={() => setEditingSeller(true)}>Edit</button>
                        {user.seller?.status === 'verified' ? (
                          <button className="primary-btn" onClick={() => navigate('/my-shop')}>
                            Go to My Shop
                          </button>
                        ) : (
                          <button
                            className="apply-ver-btn"
                            onClick={applyForVerification}
                            disabled={user.seller?.status === "pending" || user.seller?.status === "verified"}
                            title={user.seller?.status === "pending" ? "Application pending" : ""}
                          >
                            {user.seller?.status === "pending" ? "Pending" : 
                             user.seller?.status === "verified" ? "Verified" : 
                             "Apply for Verification"}
                          </button>
                        )}
                      </>
                    ) : (
                      <button className="register-btn" onClick={handleRegisterSeller}>Register as Seller</button>
                    )}
                  </div>
                </div>
              )}

              {/* EDIT MODE: inline form when editingSeller === true */}
              {editingSeller && (
                <form className="seller-edit-form" onSubmit={saveSellerInfo}>
                  <div className="form-grid">
                    <div className="form-row">
                      <label>Shop Name *</label>
                      <input 
                        className="form-input"
                        name="seller.shopName" 
                        value={user.seller?.shopName || ""} 
                        onChange={handleSellerInput} 
                        required 
                        placeholder="Enter your shop name"
                      />
                    </div>
                    <div className="form-row">
                      <label>Business Email *</label>
                      <input 
                        className="form-input"
                        name="seller.businessEmail" 
                        value={user.seller?.businessEmail || ""} 
                        onChange={handleSellerInput} 
                        type="email" 
                        required 
                        placeholder="business@example.com"
                      />
                    </div>
                    <div className="form-row">
                      <label>Phone</label>
                      <input 
                        className="form-input"
                        name="seller.phone" 
                        value={user.seller?.phone || ""} 
                        onChange={handleSellerInput} 
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div className="form-row full">
                      <label>Categories (Select all that apply)</label>
                      <div className="category-checkbox-grid">
                        {CATEGORY_OPTIONS.map((category) => (
                          <label key={category} className="category-checkbox-label">
                            <input
                              type="checkbox"
                              checked={(user.seller?.category || []).includes(category)}
                              onChange={() => handleCategoryChange(category)}
                              className="category-checkbox"
                            />
                            <span className="category-checkbox-custom"></span>
                            <span className="category-text">{category}</span>
                          </label>
                        ))}
                      </div>
                      {(user.seller?.category || []).length > 0 && (
                        <div className="selected-categories">
                          <small>Selected: {(user.seller?.category || []).join(", ")}</small>
                        </div>
                      )}
                    </div>
                    <div className="form-row full">
                      <label>Business Address</label>
                      <textarea 
                        className="form-textarea"
                        name="seller.address" 
                        value={user.seller?.address || ""} 
                        onChange={handleSellerInput} 
                        rows="3"
                        placeholder="Enter your business address"
                      />
                    </div>

                    {/* File Upload Sections with Consistent UI */}
                    <div className="form-row file-upload-row">
                      <label>Upload License / Document (Optional)</label>
                      <div className="file-upload-wrapper">
                        <label className={`file-upload-btn ${uploadingLicense ? 'uploading' : ''}`}>
                          <FaUpload className="upload-icon" />
                          {uploadingLicense ? 'Uploading...' : 'Choose License File'}
                          <input
                            type="file"
                            onChange={handleLicenseUpload}
                            className="file-input-hidden"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            disabled={uploadingLicense}
                          />
                        </label>
                        {user.seller?.licenseFileName && (
                          <div className="file-preview">
                            <span className="file-name">{user.seller.licenseFileName}</span>
                            <span className="file-status success">✓</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-row file-upload-row">
                      <label>Upload Aadhar for KYC *</label>
                      <div className="file-upload-wrapper">
                        <label className={`file-upload-btn ${uploadingAadhar ? 'uploading' : ''}`}>
                          <FaUpload className="upload-icon" />
                          {uploadingAadhar ? 'Uploading...' : 'Choose Aadhar File'}
                          <input
                            type="file"
                            onChange={handleAadharUpload}
                            className="file-input-hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            disabled={uploadingAadhar}
                          />
                        </label>
                        {user.seller?.aadharFileName && (
                          <div className="file-preview">
                            <span className="file-name">{user.seller.aadharFileName}</span>
                            <span className="file-status success">✓</span>
                          </div>
                        )}
                      </div>
                      <small className="file-help">Required for verification. Max size: 5MB</small>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button type="button" className="cancel-btn" onClick={() => setEditingSeller(false)}>Cancel</button>
                    <button type="submit" className="save-btn">Save Seller Info</button>
                    {user.seller?.licenseFileName && user.seller?.aadharFileName && user.seller?.status !== 'verified' && (
                      <button type="button" className="apply-ver-btn" onClick={applyForVerification}>
                        Apply for Verification
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>

            {/* Simple message for verified sellers (no big celebration card) */}
            {user.seller?.status === 'verified' && (
              <div className="verified-message">
                <span className="verified-badge">✓ Verified Seller</span>
                <p>Your seller account has been verified. You can now manage your shop.</p>
                <button className="primary-btn small" onClick={() => navigate('/my-shop')}>
                  Go to My Shop
                </button>
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
            <div className="card write-review-card">
              <h3>Write a Review</h3>
              <form onSubmit={submitReview}>
                <div className="form-group">
                  <label>Select Seller</label>
                  <select 
                    className="form-select"
                    value={reviewTarget} 
                    onChange={(e) => setReviewTarget(e.target.value)}
                  >
                    <option value="">-- choose seller --</option>
                    {sellers.map(s => (
                      <option key={s._id} value={s._id}>
                        {s.seller?.shopName || s.name || s.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Rating</label>
                  <select 
                    className="form-select rating-select"
                    value={reviewRating} 
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                  >
                    {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} star{n>1?'s':''}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Comment</label>
                  <textarea 
                    className="form-textarea"
                    value={reviewText} 
                    onChange={(e) => setReviewText(e.target.value)} 
                    rows={3}
                    placeholder="Share your experience..."
                  />
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn" onClick={() => { setReviewText(''); setReviewRating(5); setReviewTarget(''); }}>Clear</button>
                  <button type="submit" className="save-btn">Submit Review</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Account Settings Modals (unchanged from your original) */}
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