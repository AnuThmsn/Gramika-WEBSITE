import React, { useState } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { BsCartPlusFill } from "react-icons/bs";
import { MdWarning } from "react-icons/md";
function ProductCard({
  image,
  name,
  price,
  onAddToCart,
  stock,
  status = "Active",
  reports = 0,
  onReport
}) {
  const [quantity, setQuantity] = useState(1);
  const [showControls, setShowControls] = useState(false);

  // Theme colors
  const primaryGreen = "#195d2bff";
  const accentGreen = "#63c959";

  const isReported = status === "Reported";

  // Clamp quantity between 1 and stock
  const handleQuantityChange = (e) => {
    let newQty = Number(e.target.value);
    if (newQty < 1) newQty = 1;
    if (newQty > stock) newQty = stock;
    setQuantity(newQty);
  };

  const incrementQuantity = () => {
    if (quantity < stock) setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleInitialAdd = () => {
    if (isReported) return;
    setShowControls(true);
    setQuantity(1);
  };

  const handleFinalAddToCart = () => {
    onAddToCart(quantity);
    setShowControls(false);
    setQuantity(1);
  };

  return (
    <div
      style={{
        backgroundColor: "#fff",
        borderRadius: "24px",
        padding: "18px",
        width: "100%",
        maxWidth: "240px",
        boxShadow: "0 4px 16px rgba(26, 60, 52, 0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        margin: "0 auto",
        fontFamily: '"Lato", sans-serif',
        border: "1px solid #e0e0e0",
        opacity: isReported ? 0.85 : 1
      }}
    >
      {/* Product Image */}
      <div
        style={{
          height: "150px",
          overflow: "hidden",
          borderRadius: "16px",
          marginBottom: "12px",
          border: "1px solid #e0e0e0"
        }}
      >
        {image ? (
          <img
            src={image}
            alt={name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9aa"
            }}
          >
            No Image
          </div>
        )}
      </div>

      {/* Product Info */}
      <div style={{ textAlign: "left", flexGrow: 1, marginBottom: "10px" }}>
        <h3
          style={{
            color: primaryGreen,
            margin: "0 0 5px",
            fontSize: "1.15rem",
            fontWeight: 700
          }}
        >
          {name}
        </h3>

        <p
          style={{
            margin: "0",
            fontSize: "1.3rem",
            fontWeight: "bold",
            color: primaryGreen
          }}
        >
          ₹{price}
        </p>

        {stock > 0 && !isReported && (
          <p
            style={{
              margin: "5px 0 0",
              fontSize: "0.9rem",
              color: accentGreen
            }}
          >
            In Stock: {stock}
          </p>
        )}

        {isReported && (
          <p
            style={{
              margin: "5px 0 0",
              fontSize: "0.85rem",
              color: "#f4ff8e",
              fontWeight: 600
            }}
          >
            ⚠ Reported ({reports})
          </p>
        )}
      </div>

      {/* Controls Section */}
      {stock > 0 && !isReported ? (
        <div style={{ marginTop: "10px" }}>
          {!showControls && (
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                onClick={handleInitialAdd}
                style={{
                  flex: 1,
                  backgroundColor: primaryGreen,
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "12px",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "1rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px"
                }}
              >
                <BsCartPlusFill size={16} /> ADD
              </button>

              <button
                onClick={onReport}
                title="Report product"
                style={{
                  background: "#ffffff",
                  border: "0px solid #e1ff4d",
                  borderRadius: "12px",
                  padding: "9px",
                  cursor: "pointer"
                }}
              >
                <MdWarning size={22} color="#ff9800" />
              </button>
            </div>
          )}

          {showControls && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <button
                onClick={decrementQuantity}
                disabled={quantity <= 1}
                style={{
                  backgroundColor: primaryGreen,
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "12px",
                  width: "40px",
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
                  width: "100%",
                  padding: "8px 4px",
                  borderRadius: "12px",
                  border: `1px solid ${primaryGreen}`,
                  textAlign: "center"
                }}
              />

              <button
                onClick={incrementQuantity}
                disabled={quantity >= stock}
                style={{
                  backgroundColor: primaryGreen,
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "12px",
                  width: "40px",
                  opacity: quantity >= stock ? 0.5 : 1
                }}
              >
                <FaPlus size={12} />
              </button>

              <button
                onClick={handleFinalAddToCart}
                style={{
                  backgroundColor: primaryGreen,
                  color: "#fff",
                  border: "none",
                  padding: "10px",
                  borderRadius: "12px",
                  marginLeft: "5px"
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
            marginTop: "10px",
            backgroundColor: "#bdbdbd",
            color: "#fff",
            border: "none",
            padding: "10px",
            borderRadius: "12px",
            fontWeight: 700
          }}
        >
          {isReported ? `Reported (${reports})` : "Out of Stock"}
        </button>
      )}
    </div>
  );
}

export default ProductCard;