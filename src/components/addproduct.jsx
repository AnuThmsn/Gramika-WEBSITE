import React, { useEffect, useState } from "react";
import "./AddProductPage.css";
const AddProductPage = ({ onSubmit, editingProduct, cancelEdit }) => {
const [form, setForm] = useState({
productName: "",
category: "Vegetables",
description: "",
images: [],
price: "",
quantity: "",
unit: "kg",
source: "",
location: "",
expiryDate: "",
deliveryOptions: {
homeDelivery: false,
pickup: false,
shipping: false,
},
});
useEffect(() => {
if (editingProduct) {
setForm(editingProduct);
}
}, [editingProduct]);
const handleSubmit = (e) => {
e.preventDefault();
const imageUrls = Array.from(form.images).map((file) =>
typeof file === "string" ? file : URL.createObjectURL(file)
);
const newProduct = {
id: editingProduct?.id || Date.now(),
productName: form.productName,
category: form.category,
description: form.description,
images: imageUrls,
price: form.price,
quantity: form.quantity,
unit: form.unit,
source: form.source,
location: form.location,
expiryDate: form.expiryDate,
deliveryOptions: form.deliveryOptions,
};
onSubmit(newProduct);
};
const handleChange = (e) => {
const { name, value } = e.target;
setForm({ ...form, [name]: value });
};
const handleFileChange = (e) => {
const files = Array.from(e.target.files);
setForm({ ...form, images: files });
};
const handleCheckboxChange = (e) => {
const { name, checked } = e.target;
setForm((prevForm) => ({
...prevForm,
deliveryOptions: {
...prevForm.deliveryOptions,
[name]: checked,
},
}));
};
return (
<div className="form-container">
<div className="form-header">
<h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
<button className="close-btn" onClick={cancelEdit} title="Close">
&times;
</button>
</div>
<form className="product-form" onSubmit={handleSubmit}>
{renderInput("Product Name", "productName", "text", form, handleChange)}
{renderSelect("Category", "category", form, handleChange, [
"Vegetables",
"Fruits",
"Grains",
"Dairy",
"Others",
])}
{renderTextarea("Description", "description", form, handleChange)}
<div className="form-group">
<label>Product Images:</label>
<input type="file" accept="image/*" multiple onChange={handleFileChange} />
</div>
{form.images.length > 0 && (
<div className="image-preview">
{form.images.map((img, i) => {
const src = typeof img === "string" ? img : URL.createObjectURL(img);
return <img key={i} src={src} alt={`preview-${i}`} />;
})}
</div>
)}
{renderInput("Price (₹)", "price", "number", form, handleChange, true)}
{renderInput("Quantity", "quantity", "number", form, handleChange, true)}
{renderSelect("Unit", "unit", form, handleChange, ["kg", "litre", "piece"])}
{renderInput("Source", "source", "text", form, handleChange)}
{renderInput("Location / Origin", "location", "text", form, handleChange)}
{renderInput("Expiry Date", "expiryDate", "date", form, handleChange)}
{/* Corrected Delivery Options Section */}
<div className="form-group">
<label>Delivery Options:</label>
<div className="delivery-options-group">
<div className="checkbox-item">
<input
type="checkbox"
name="homeDelivery"
checked={form.deliveryOptions.homeDelivery}
onChange={handleCheckboxChange}
id="homeDelivery"
/>
<label htmlFor="homeDelivery">Home Delivery</label>
</div>
<div className="checkbox-item">
<input
type="checkbox"
name="pickup"
checked={form.deliveryOptions.pickup}
onChange={handleCheckboxChange}
id="pickup"
/>
<label htmlFor="pickup">Pickup</label>
</div>
<div className="checkbox-item">
<input
type="checkbox"
name="shipping"
checked={form.deliveryOptions.shipping}
onChange={handleCheckboxChange}
id="shipping"
/>
<label htmlFor="shipping">Shipping Available</label>
</div>
</div>
</div>
<button type="submit" className="save-btn">
{editingProduct ? "Update Product" : "Save Product"}
</button>
</form>
</div>
);
};
// Reusable input
const renderInput = (label, name, type, form, handleChange, required = false) => (
<div className="form-group">
<label>{label}:</label>
<input
type={type}
name={name}
value={form[name]}
onChange={handleChange}
required={required}
/>
</div>
);
// Reusable select
const renderSelect = (label, name, form, handleChange, options) => (
<div className="form-group">
<label>{label}:</label>
<select name={name} value={form[name]} onChange={handleChange}>
{options.map((opt) => (
<option key={opt} value={opt}>
{opt}
</option>
))}
</select>
</div>
);
// Reusable textarea
const renderTextarea = (label, name, form, handleChange) => (
<div className="form-group">
<label>{label}:</label>
<textarea
name={name}
value={form[name]}
onChange={handleChange}
rows={3}
/>
</div>
);
export default AddProductPage;