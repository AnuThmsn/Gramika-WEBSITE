import React, { useState } from 'react';
import './SellerRegistrationModal.css';

export default function SellerRegistrationModal({ isOpen, onClose, onSubmit, sellerStatus }) {
  const [sellerDetails, setSellerDetails] = useState({
    shopName: '',
    category: '',
    businessEmail: '',
    phone: '',
    address: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSellerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(sellerDetails);
    setSellerDetails({
      shopName: '',
      category: '',
      businessEmail: '',
      phone: '',
      address: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Seller Registration</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <input 
            type="text" 
            name="shopName"
            placeholder="Shop Name" 
            value={sellerDetails.shopName}
            onChange={handleInputChange}
            autoComplete="organization"
            required 
          />
          <input 
            type="text" 
            name="category"
            placeholder="Category (e.g., Organic Vegetables, Handmade Crafts)" 
            value={sellerDetails.category}
            onChange={handleInputChange}
            autoComplete="organization-title"
            required 
          />
          <input 
            type="email" 
            name="businessEmail"
            placeholder="Business Email" 
            value={sellerDetails.businessEmail}
            onChange={handleInputChange}
            autoComplete="email"
            required 
          />
          <input 
            type="tel" 
            name="phone"
            placeholder="Phone" 
            value={sellerDetails.phone}
            onChange={handleInputChange}
            autoComplete="tel"
          />
          <textarea 
            name="address"
            placeholder="Business Address" 
            value={sellerDetails.address}
            onChange={handleInputChange}
            rows="3"
            autoComplete="street-address"
          ></textarea>

          <div className="modal-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-btn">
              Submit Application
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}