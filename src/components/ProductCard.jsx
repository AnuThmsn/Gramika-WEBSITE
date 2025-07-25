import React, { useState } from 'react';

function ProductCard({ image, name, price, onAddToCart, stock }) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '10px',
      padding: '16px',
      width: '200px',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      textAlign: 'center'
    }}>
      <img
        src={image}
        alt={name}
        style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
      />

      <h3 style={{ color: '#2e7d32', margin: '10px 0 5px' }}>{name}</h3>
      <p style={{ margin: 0, fontWeight: 'bold' }}>₹{price}</p>

      {stock > 0 ? (
        <>
          <input
            type="number"
            min="1"
            max={stock}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            style={{
              width: '60px',
              marginTop: '8px',
              padding: '5px',
              borderRadius: '5px',
              border: '1px solid #ccc'
            }}
          />

          <button
            onClick={() => onAddToCart(quantity)}
            style={{
              marginTop: '10px',
              backgroundColor: '#81c784',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
            Add to Bag
          </button>
        </>
      ) : (
        <button
          disabled
          style={{
            marginTop: '10px',
            backgroundColor: 'gray',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: '5px',
            cursor: 'not-allowed',
          }}
        >
          Out of Stock
        </button>
      )}
    </div>
  );
}

export default ProductCard;