import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import MonthlySellHistory from './components/MonthlySellHistory';
import OrderGraph from './components/OrderGraph';
import Header from './components/Header';
import './orders.css';
const locationRoutes = {
 Chennai: ['Vellore', 'Kanchipuram', 'Chengalpattu', 'Chennai'],
 Kochi: ['Palakkad', 'Thrissur', 'Ernakulam', 'Kochi'],
 Mumbai: ['Thane', 'Dadar', 'Kurla', 'Mumbai'],
};
const initialOrders = [
 {
 id: 1,
 customer: 'Alice',
 location: 'Chennai',
 amount: 120,
 status: 'Pending',
 date: '2025-07-10',
 currentLocation: 'Vellore',
 },
 {
 id: 2,
 customer: 'Bob',
 location: 'Kochi',
 amount: 240,
 status: 'Out for Delivery',
 date: '2025-07-15',
 currentLocation: 'Thrissur',
 },
 {
 id: 3,
 customer: 'Charlie',
 location: 'Mumbai',
 amount: 180,
 status: 'Delivered',
 date: '2025-07-16',
 currentLocation: 'Mumbai',
 },
];
function orders() {
 const [orders, setOrders] = useState(initialOrders);
 const [filter, setFilter] = useState('All');
 const [search, setSearch] = useState('');
 const [expandedMapId, setExpandedMapId] = useState(null);
 useEffect(() => {
 const interval = setInterval(() => {
 setOrders(prevOrders =>
 prevOrders.map(order => {
 if (order.status !== 'Out for Delivery') return order;
 const route = locationRoutes[order.location] || [];
 const currentIndex = route.indexOf(order.currentLocation);
 const nextLocation = route[currentIndex + 1] || order.currentLocation;
 return {
 ...order,
 currentLocation: nextLocation,
 };
 })
 );
 }, 5000);
 return () => clearInterval(interval);
 }, []);
 const handleStatusChange = (id, newStatus) => {
 setOrders(orders.map(order =>
 order.id === id ? { ...order, status: newStatus } : order
 ));
 };
 const handleLocationChange = (id, newLocation) => {
 setOrders(orders.map(order =>
 order.id === id ? { ...order, currentLocation: newLocation } : order
 ));
 };
 const filteredOrders = orders.filter(order =>
 (filter === 'All' || order.status === filter) &&
 (order.customer.toLowerCase().includes(search.toLowerCase()) ||
 order.location.toLowerCase().includes(search.toLowerCase()))
 );
 const statusCounts = {
 Pending: orders.filter(o => o.status === 'Pending').length,
 'Out for Delivery': orders.filter(o => o.status === 'Out for Delivery').length,
 Delivered: orders.filter(o => o.status === 'Delivered').length,
 };
 return (
 <div style={{ padding: '20px' }}>
 <Header />
 <nav className="nav-links" style={{ marginBottom: '20px' }}>
 <Link to="/" className="nav-link">Dashboard</Link>
 <Link to="/monthly-history" className="nav-link">Monthly History</Link>
 <Link to="/order-graph" className="nav-link">Review</Link>
 </nav>
 <Routes>
 <Route path="/" element={
 <>
 <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
 {Object.entries(statusCounts).map(([status, count]) => (
 <div key={status} className={`status ${status.toLowerCase().replace(/ /g, '-')}`}>
 <strong>{status}</strong>: {count}
 </div>
 ))}
 </div>
 <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
 <select value={filter} onChange={(e) => setFilter(e.target.value)}>
 <option>All</option>
 <option>Pending</option>
 <option>Out for Delivery</option>
 <option>Delivered</option>
 </select>
 <input
 type="text"
 placeholder="Search by name or location"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 />
 </div>
 {filteredOrders.map(order => (
 <div key={order.id} className={`order-card status-${order.status}`}>
 <h4>�� Order #{order.id}</h4>
 <p><strong>Customer:</strong> {order.customer}</p>
 <p><strong>Location:</strong> {order.location}</p>
 <p><strong>Amount:</strong> ₹{order.amount}</p>
 <p><strong>Date:</strong> {order.date}</p>
 <p><strong>Status:</strong> <span style={{ marginLeft: '5px' }}>{order.status}</span></p>
 {/* Steps section updated */}
 <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
 {['Ordered', 'Packed', 'Delivered'].map((step) => {
 const isActive =
 (step === 'Ordered') ||
 (step === 'Packed' && order.status !== 'Pending') ||
 (step === 'Delivered' && order.status === 'Delivered');
 return (
 <div
 key={step}
 className={`status-step ${isActive ? 'active' : ''}`}
 >
 {step}
 </div>
 );
 })}
 </div>
 <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '10px' }}>
 <div
 onClick={() => setExpandedMapId(expandedMapId === order.id ? null : order.id)}
 style={{
 cursor: 'pointer',
 width: expandedMapId === order.id ? '300px' : '150px',
 height: expandedMapId === order.id ? '200px' : '150px',
 transition: '0.3s ease',
 border: '2px solid #ccc',
 borderRadius: '10px',
 overflow: 'hidden',
 }}
 >
 <iframe
 title={`Map-${order.id}`}
 width="100%"
 height="100%"
 frameBorder="0"
 src={`https://maps.google.com/maps?q=${encodeURIComponent(order.currentLocation)}&z=13&output=embed`}
 allowFullScreen
 style={{ pointerEvents: expandedMapId === order.id ? 'auto' : 'none' }}
 ></iframe>
 </div>
 <div>
 <p style={{ fontSize: '14px', margin: 0 }}>
 <strong>Current Location:</strong> {order.currentLocation}
 </p>
 <p style={{ fontSize: '12px', marginTop: '5px' }}>
 {expandedMapId === order.id ? 'Click map to collapse' : 'Click map to expand'}
 </p>
 </div>
 </div>
 <input
 type="text"
 placeholder="Update current location"
 onChange={(e) => handleLocationChange(order.id, e.target.value)}
 style={{ marginTop: '10px', width: '100%' }}
 />
 <div style={{ marginTop: '10px' }}>
 {order.status === 'Pending' && (
 <button className="button button-send" onClick={() => handleStatusChange(order.id, 'Out for Delivery')}>
 Send Delivery
 </button>
 )}
 {order.status === 'Out for Delivery' && (
 <button className="button button-delivered" onClick={() => handleStatusChange(order.id, 'Delivered')}>
 Mark as Delivered
 </button>
 )}
 </div>
 </div>
 ))}
 </>
 } />
 <Route path="/monthly-history" element={<MonthlySellHistory orders={orders} />} />
 <Route path="/order-graph" element={<OrderGraph orders={orders} />} />
 </Routes>
 </div>
 );
}
export default orders; 