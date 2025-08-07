import React, { useState } from "react";
import AddProductPage from "./AddProductPage";
import Header from "./Header";
import "./SellerDashboard.css";
const SellerDashboard = () => {
const [view, setView] = useState("list");
const [products, setProducts] = useState([]);
const [editingProduct, setEditingProduct] = useState(null);
const [selectedProduct, setSelectedProduct] = useState(null);
const handleProductSubmit = (product) => {
setProducts((prev) => {
const exists = prev.find((p) => p.id === product.id);
return exists ? prev.map((p) => (p.id === product.id ? product : p)) : [product, ...prev];
});
setEditingProduct(null);
setView("list");
};
const handleDelete = (id) => {
if (window.confirm("Are you sure you want to delete this product?")) {
setProducts((prev) => prev.filter((p) => p.id !== id));
setSelectedProduct(null);
}
};
return (
<div>
<Header />
<main className="main-content">
{view === "list" && (
<div className="list-view">
<div className="list-header">
<h3>Product List</h3>
<button
onClick={() => {
setEditingProduct(null);
setView("form");
}}
className="primary-btn"
>
+ Add Product
</button>
</div>
{products.length === 0 ? (
<p>No products added yet.</p>
) : (
<div className="product-grid">
{products.map((product) => (
<div key={product.id} className="product-card">
{product.discount > 0 && (
<span className="discount-tag">-{product.discount}%</span>
)}
{product.quantity > 0 ? (
<span className="stock-status in">In Stock</span>
) : (
<span className="stock-status out">Out of Stock</span>
)}
<img
src={product.images?.[0] || "https://via.placeholder.com/160"}
alt={product.productName}
className="card-image"
/>
<h3 className="card-title">{product.productName}</h3>
<p className="card-qty">Qty: {product.quantity} {product.unit}</p>
<p className="card-price">₹ {product.price}</p>
<button className="details-btn" onClick={() =>
setSelectedProduct(product)}>Details</button>
</div>
))}
</div>
)}
</div>
)}
{view === "form" && (
<AddProductPage
onSubmit={handleProductSubmit}
editingProduct={editingProduct}
cancelEdit={() => {
setEditingProduct(null);
setView("list");
}}
/>
)}
{/* Product Detail Modal with CSS classes */}
{selectedProduct && (
<div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
<div
className="product-detail-modal"
onClick={(e) => e.stopPropagation()}
>
<button className="modal-close" onClick={() => setSelectedProduct(null)}
title="Close">
✖
</button>
<img
src={selectedProduct.images?.[0] || "https://via.placeholder.com/380x285"}
alt={selectedProduct.productName}
className="modal-main-image"
/>
<div className="modal-body">
<h2 className="modal-title">Key Highlights</h2>
{[
["Category", selectedProduct.category],
["Description", selectedProduct.description],
["Price", `₹${selectedProduct.price}`],
["Unit", selectedProduct.unit],
["Quantity", selectedProduct.quantity],
["Discount", selectedProduct.discount ? `${selectedProduct.discount}%` : null],
["Source", selectedProduct.source],
["Source Name", selectedProduct.sourceName],
["Mode of Delivery", selectedProduct.modeOfDelivery],
["Expiry Date", selectedProduct.expiryDate],
["Notes", selectedProduct.additionalNotes],
].map(
([label, value]) =>
value && (
<div key={label} className="modal-field">
<strong>{label}</strong>
<p>{value}</p>
</div>
)
)}
</div>
{selectedProduct.images?.length > 1 && (
<div className="modal-images">
{selectedProduct.images.map((img, i) => (
<img
key={i}
src={img}
alt={`product-${i}`}
className="modal-image"
/>
))}
</div>
)}
<div className="modal-actions">
<span
className="action-icon edit"
title="Edit"
onClick={() => {
setEditingProduct(selectedProduct);
setView("form");
setSelectedProduct(null);
}}
>

</span>
<span
className="action-icon delete"
title="Delete"
onClick={() => handleDelete(selectedProduct.id)}
>

</span>
</div>
</div>
</div>
)}
</main>
</div>
);
};
export default SellerDashboard;