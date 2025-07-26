// src/components/CheckoutModal.jsx
import React, { useState } from 'react';
import './checkoutModal.css';

import { IoLocationOutline, IoClose } from 'react-icons/io5';
import { MdOutlinePayment } from 'react-icons/md';
import { FiEdit } from 'react-icons/fi';

const CheckoutModal = ({ isOpen, onClose, grandTotal }) => {
    // We'll have two main steps now: 'address' and 'paymentMethod'
    const [currentStep, setCurrentStep] = useState('address');

    if (!isOpen) return null;

    const mockAddress = {
        name: 'Valummel',
        city: 'Kochi',
        fullAddress: '63/3441, Aroor - Thoppumpady Rd, Thoppumpady, Kochi, Kerala 682005, India',
        contactName: 'Anu Thomson',
        contactPhone: '9562607325'
    };

    const handleContinueToPaymentMethod = () => {
        // Here you might validate address fields
        setCurrentStep('paymentMethod');
    };

    const handleProceedToPay = () => {
        // Here you would integrate with your payment gateway
        alert(`Proceeding to pay ₹${grandTotal}. (Payment Gateway Integration goes here)`);
        onClose();
        setCurrentStep('address'); // Reset step for next time it opens
    };

    return (
        <div className={`checkout-modal-overlay ${isOpen ? 'open' : ''}`}>
            <div className="checkout-modal-content">
                <div className="checkout-modal-header">
                    {/* Dynamic Header Text */}
                    <h3>
                        {currentStep === 'address' && 'Enter complete address'}
                        {currentStep === 'paymentMethod' && 'Select Payment Method'}
                    </h3>
                    <button className="close-checkout-modal" onClick={() => {
                        onClose();
                        setCurrentStep('address'); // Reset step on close
                    }}>
                        <IoClose />
                    </button>
                </div>

                {currentStep === 'address' && (
                    <div className="modal-section address-section">
                        <h4><IoLocationOutline className="section-icon" /> Delivery Address</h4>
                        <div className="address-card">
                            <p className="address-title">{mockAddress.name}, {mockAddress.city}</p>
                            <p className="address-full">{mockAddress.fullAddress}</p>
                            <p className="address-contact">{mockAddress.contactName} - {mockAddress.contactPhone}</p>
                            <button className="edit-address-button"><FiEdit /> Edit</button>
                        </div>
                        <button className="add-address-button">
                            + Add a new address
                        </button>
                        {/* Footer for Address Step */}
                        <div className="modal-footer">
                            <span className="modal-total">₹{grandTotal} TOTAL</span>
                            <button className="modal-proceed-button" onClick={handleContinueToPaymentMethod}>
                                Continue to Payment &rarr; {/* Changed button text */}
                            </button>
                        </div>
                    </div>
                )}

                {currentStep === 'paymentMethod' && ( // New condition for the payment method step
                    <div className="modal-section payment-options-section">
                        <h4><MdOutlinePayment className="section-icon" /> Payment Options</h4>
                        <div className="payment-options-list">
                            <label className="payment-option">
                                <input type="radio" name="paymentMethod" value="upi" defaultChecked />
                                UPI / Credit / Debit Card
                            </label>
                            <label className="payment-option">
                                <input type="radio" name="paymentMethod" value="cod" />
                                Cash on Delivery
                            </label>
                        </div>
                        {/* Footer for Payment Method Step */}
                        <div className="modal-footer">
                            <span className="modal-total">₹{grandTotal} TOTAL</span>
                            <button className="modal-proceed-button" onClick={handleProceedToPay}>
                                Proceed to Pay &rarr; {/* Final button text */}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CheckoutModal;