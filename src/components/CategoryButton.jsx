import React from 'react';

function CategoryButton({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: '20px',
        backgroundColor: '#ffffff',
        color: '#4F7942',
        border: '2px solid #4F7942',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background-color 0.3s',
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = '#e0f2f1'}
      onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
    >
      {label}
    </button>
  );
}

export default CategoryButton;