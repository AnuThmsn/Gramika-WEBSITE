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
import { API_BASE, buildImageUrl } from '../config';

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
        const res = await fetch(`${API_BASE}/api/users/me`, {
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
              shopName: userData.seller?.name || userData.seller?.shopName || "",
              category: sellerCategory,
              businessEmail: userData.seller?.businessEmail || "",
              phone: userData.seller?.phone || "",
              address: userData.seller?.address || "",
              licenseFileName: userData.seller?.licenseFileName || "",
              aadharFileName: userData.seller?.aadharFileName || "",
              status: userData.seller?.status || "not_seller"
            }
          });

          // Fetch recent orders
          const ordersRes = await fetch(`${API_BASE}/api/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (ordersRes.ok) {
            const ordersData = await ordersRes.json();
            setRecentOrders(ordersData.slice(0, 3));
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

  // Quick feedback
  const [quickFeedback, setQuickFeedback] = useState({ rating: 5, comment: "" });

  // Recent orders state
  const [recentOrders, setRecentOrders] = useState([]);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

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
        const res = await fetch(`${API_BASE}/api/users/sellers`);
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
      const res = await fetch(`${API_BASE}/api/users/me/seller/license`, {
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
      const res = await fetch(`${API_BASE}/api/users/me/seller/aadhar`, {
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
      const res = await fetch(`${API_BASE}/api/users/me/seller`, {
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
      const res = await fetch(`${API_BASE}/api/users/me/seller`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          seller: { ...user.seller, status: 'pending' },
          isSeller: true
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem('gramika_is_seller', 'true');
        localStorage.setItem('gramika_seller_status', 'pending');

        setEditingSeller(false);
        alert("Application sent — status: PENDING. Your seller details have been saved.");
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
      const res = await fetch(`${API_BASE}/api/reviews`, {
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
      const res = await fetch(`${API_BASE}/api/users/me/password`, {
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
      const res = await fetch(`${API_BASE}/api/users/me`, {
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

  const handleLogout = () => {
    localStorage.removeItem('gramika_token');
    localStorage.removeItem('gramika_user_id');
    localStorage.removeItem('gramika_is_admin');
    localStorage.removeItem('gramika_is_seller');
    localStorage.removeItem('gramika_seller_status');
    navigate('/login');
  };

  const handleRegisterSeller = () => {
    setUser(prev => ({
      ...prev,
      seller: {
        shopName: prev.seller?.shopName || "",
        category: prev.seller?.category || [],
        businessEmail: prev.seller?.businessEmail || prev.email || "",
        phone: prev.seller?.phone || prev.phone || "",
        address: prev.seller?.address || prev.address || "",
        licenseFileName: prev.seller?.licenseFileName || "",
        aadharFileName: prev.seller?.aadharFileName || "",
        status: prev.seller?.status && prev.seller.status !== 'not_seller'
          ? prev.seller.status
          : "registered"
      },
      isSeller: true
    }));

    setEditingSeller(true);
  };

  const handleFetchMyOrders = async () => {
    setLoadingOrders(true);
    setShowOrdersModal(true);
    const token = localStorage.getItem('gramika_token');

    try {
      const res = await fetch(`${API_BASE}/api/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMyOrders(data || []);
      } else {
        alert('Failed to fetch orders');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while fetching orders.');
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleReportOrderNotReached = async (orderId) => {
    if (!window.confirm("Are you sure you want to report this order as not reached?")) return;

    const token = localStorage.getItem('gramika_token');
    try {
      const res = await fetch(`${API_BASE}/api/orders/${orderId}/report`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Order reported as not reached. Admin will review the seller.');
        setMyOrders(prev => prev.map(o => o._id === orderId ? { ...o, reportedNotReached: true } : o));
      } else {
        alert('Failed to report order.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while reporting.');
    }
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
                <img src={buildImageUrl(user.avatar)} alt="avatar" className="avatar-img" />
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
                    {user.isAdmin ? "Admin" : (user.isSeller && user.seller?.status === 'verified') ? "Seller" : "Buyer"}
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
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} star{n > 1 ? 's' : ''}</option>)}
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
                            <span className="file-name">{getDisplayFilename(user.seller.licenseFileName)}</span>
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
                            <span className="file-name">{getDisplayFilename(user.seller.aadharFileName)}</span>
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

            {/* Recent Orders Overview */}
            <div className="card activity-card">
              <div className="activity-header">
                <h3>Recent ORDERS</h3>
                <span className="muted">Recent</span>
              </div>
              <ul className="activity-list">
                {recentOrders.length === 0 ? (
                  <li className="activity-item">
                    <span className="activity-text" style={{ color: '#666' }}>No recent orders.</span>
                  </li>
                ) : (
                  recentOrders.map((order) => (
                    <li key={order._id} className="activity-item">
                      <span className="activity-text">
                        Order #{(order._id || '').slice(-6).toUpperCase()} - ₹{order.total} <br />
                        <small style={{ color: '#666' }}>
                          {(order.items || []).map(it => `${it.name || (it.product && it.product.name)} x${it.quantity}`).join(', ')}
                        </small>
                      </span>
                      <small className="activity-date">{new Date(order.createdAt).toLocaleDateString()}</small>
                    </li>
                  ))
                )}
              </ul>

              <div className="activity-actions">
                <button className="outline-btn" onClick={handleFetchMyOrders}>View All Orders</button>
              </div>
            </div>

            {/* Account Settings bottom of right column */}
            <div className="card settings-card bottom-settings">
              <h3>Account Settings</h3>
              <div className="settings-options-horizontal">
                <button className="outline-btn" onClick={() => setShowChangePassword(true)}>Change Password</button>
                <button className="outline-btn" onClick={() => setShowNotifications(true)}>Notifications</button>
                <button className="outline-btn" onClick={() => setShowPrivacy(true)}>Privacy</button>
                <button className="danger outline-btn" onClick={() => setShowDeleteAccount(true)}>Delete Account</button>
                <button className="primary-btn logout-btn" onClick={handleLogout}>Logout</button>
              </div>
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
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
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
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                />
                Email notifications
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                />
                Push notifications
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={notifications.sms}
                  onChange={(e) => setNotifications({ ...notifications, sms: e.target.checked })}
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
                  onChange={(e) => setPrivacy({ ...privacy, profileVisible: e.target.checked })}
                />
                Make profile visible to other users
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={privacy.showEmail}
                  onChange={(e) => setPrivacy({ ...privacy, showEmail: e.target.checked })}
                />
                Show email address on profile
              </label>
            </div>
            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={privacy.showPhone}
                  onChange={(e) => setPrivacy({ ...privacy, showPhone: e.target.checked })}
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

      {/* Orders Modal */}
      {showOrdersModal && (
        <div className="modal-overlay" onClick={() => setShowOrdersModal(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '800px', width: '90%', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px', color: '#1a3c22ff' }}>
              My Orders
            </h3>

            {loadingOrders ? (
              <p style={{ textAlign: 'center', padding: '20px' }}>Loading your orders...</p>
            ) : myOrders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '20px', color: '#666' }}>You haven't placed any orders yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {myOrders.map(order => (
                  <div key={order._id} style={{
                    border: '1px solid #eee',
                    borderRadius: '8px',
                    padding: '15px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    backgroundColor: '#fafafa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                      <strong>Order #{(order._id || '').slice(-6).toUpperCase()}</strong>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textTransform: 'capitalize',
                        backgroundColor: order.status === 'delivered' ? '#d4edda' : order.status === 'cancelled' ? '#f8d7da' : '#fff3cd',
                        color: order.status === 'delivered' ? '#155724' : order.status === 'cancelled' ? '#721c24' : '#856404'
                      }}>
                        {order.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px' }}>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                      <p style={{ margin: '0 0 5px 0' }}><strong>Total:</strong> ₹{order.total}</p>

                      <div style={{ marginTop: '10px' }}>
                        <strong>Items:</strong>
                        <ul style={{ margin: '5px 0 0 0', paddingLeft: '20px', color: '#555' }}>
                          {(order.items || []).map((item, idx) => (
                            <li key={idx}>
                              {item.name || (item.product && item.product.name) || 'Unknown Item'}
                              <span style={{ fontWeight: '600', marginLeft: '5px' }}>x{item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Report order not reached button */}
                      {order.status !== 'cancelled' && (
                        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'flex-end' }}>
                          {order.reportedNotReached ? (
                            <span style={{ color: '#d9534f', fontSize: '13px', fontWeight: 'bold' }}>
                              ⚠ Reported as not reached
                            </span>
                          ) : (
                            <button
                              onClick={() => handleReportOrderNotReached(order._id)}
                              style={{
                                background: 'transparent',
                                border: '1px solid #d9534f',
                                color: '#d9534f',
                                padding: '6px 12px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              Report Not Reached
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowOrdersModal(false)}
                style={{
                  background: '#1a3c22ff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}