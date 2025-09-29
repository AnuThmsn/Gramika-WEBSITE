import React, { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { BsCartPlusFill } from "react-icons/bs";

function ProductCard({ image, name, price, onAddToCart, stock }) {
  const [quantity, setQuantity] = useState(1);
  const [showControls, setShowControls] = useState(false);

  // Theme colors matching header
  const primaryGreen = '#195d2bff'; // dark green
  const accentGreen = '#63c959';  // accent green
  const cardBackgroundColor = '#fff';

  // Clamp quantity between 1 and stock when input changes
  const handleQuantityChange = (e) => {
    let newQty = Number(e.target.value);
    if (newQty < 1) newQty = 1;
    if (newQty > stock) newQty = stock;
    setQuantity(newQty);
  };

  const incrementQuantity = () => {
    if (quantity < stock) {
      setQuantity(prev => prev + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };
  
  const handleInitialAdd = () => {
      setShowControls(true);
      setQuantity(1);
  };

  const handleFinalAddToCart = () => {
    onAddToCart(quantity);
    setShowControls(false);
    setQuantity(1);
  }

  return (
    <div style={{
      backgroundColor: cardBackgroundColor,
      borderRadius: '24px',
      padding: '18px',
      width: '100%',
      maxWidth: '240px',
      boxShadow: '0 4px 16px rgba(26, 60, 52, 0.08)',
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      margin: '0 auto',
      fontFamily: '"Lato", sans-serif',
      border: '1px solid #e0e0e0',
      transition: 'transform 0.2s ease-in-out'
    }}>
      {/* Product Image */}
      <div style={{
        height: '150px',
        overflow: 'hidden',
        borderRadius: '16px',
        marginBottom: '12px',
        border: '1px solid #e0e0e0'
      }}>
        <img
          src={image}
          alt={name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>

      {/* Product Info */}
      <div style={{ textAlign: 'left', flexGrow: 1, marginBottom: '10px' }}>
        <h3 style={{
          color: primaryGreen,
          margin: '0 0 5px',
          fontSize: '1.15rem',
          fontWeight: 700,
          fontFamily: '"Lato", sans-serif'
        }}>{name}</h3>
        <p style={{
          margin: '0',
          fontSize: '1.3rem',
          fontWeight: 'bold',
          color: primaryGreen // <-- dark green for price
        }}>₹{price}</p>
        {stock > 0 && (
          <p style={{ margin: '5px 0 0', fontSize: '0.9rem', color: accentGreen }}>
            In Stock: {stock}
          </p>
        )}
      </div>

      {/* Controls Section */}
      {stock > 0 ? (
        <div style={{ marginTop: '10px' }}>
          {!showControls && (
            <button
              onClick={handleInitialAdd}
              style={{
                backgroundColor: primaryGreen, // dark green
                color: '#fff', // white font
                border: 'none',
                width: '100%',
                padding: '10px 15px',
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '1rem',
                fontFamily: '"Lato", sans-serif',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <BsCartPlusFill size={16} /> ADD
            </button>
          )}

          {showControls && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '5px'
            }}>
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                style={{
                  backgroundColor: primaryGreen,
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  flexShrink: 0,
                  width: '40px',
                  opacity: quantity <= 1 ? 0.5 : 1
                }}
              >
                <FaMinus size={12} />
              </button>
              <input
                type="number"
                min="1"
                max={stock}
                value={quantity}
                onChange={handleQuantityChange}
                style={{
                  width: '100%',
                  padding: '8px 4px',
                  borderRadius: '12px',
                  border: `1px solid ${primaryGreen}`,
                  textAlign: 'center',
                  fontSize: '1rem',
                  fontFamily: '"Lato", sans-serif',
                  MozAppearance: 'textfield',
                  WebkitAppearance: 'none',
                  appearance: 'none'
                }}
              />
              <button
                onClick={incrementQuantity}
                disabled={quantity >= stock}
                style={{
                  backgroundColor: primaryGreen,
                  color: '#fff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  flexShrink: 0,
                  width: '40px',
                  opacity: quantity >= stock ? 0.5 : 1
                }}
              >
                <FaPlus size={12} />
              </button>
              <button
                onClick={handleFinalAddToCart}
                style={{
                  backgroundColor: primaryGreen, // dark green
                  color: '#fff', // white font
                  border: 'none',
                  padding: '10px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '1rem',
                  flexShrink: 0,
                  marginLeft: '5px',
                  fontFamily: '"Lato", sans-serif'
                }}
              >
                <BsCartPlusFill size={16} />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          disabled
          style={{
            marginTop: '10px',
            backgroundColor: '#bdbdbd',
            color: '#fff',
            border: 'none',
            padding: '10px 15px',
            borderRadius: '12px',
            cursor: 'not-allowed',
            fontWeight: 700,
            fontSize: '1rem',
            fontFamily: '"Lato", sans-serif'
          }}
        >
          Out of Stock
        </button>
      )}
    </div>
  );
}

export default ProductCard;
