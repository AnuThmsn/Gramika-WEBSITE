import React, { useState } from 'react';
import './Dashboard.css';
const dummyOrders = [
 { id: 1, status: 'Delivered', location: 'Chennai' },
 { id: 2, status: 'Packed', location: 'Bangalore' },
 { id: 3, status: 'Ordered', location: 'Hyderabad' },
];
const Dashboard = () => {
 const [mapExpanded, setMapExpanded] = useState(false);
 const toggleMapSize = () => {
 setMapExpanded(!mapExpanded);
 };
 return (
 <div className="dashboard-container">
 <h2>귑귒귓귔귕귖 Orders Dashboard</h2>
 <div className="orders-list">
 {dummyOrders.map(order => (
 <div key={order.id} className="order-card">
 <h3>Order #{order.id}</h3>
 <p>Location: {order.location}</p>
 <p>
 Status:{" "}
 <span className={`status-label ${order.status.toLowerCase()}`}>
 {order.status}
 </span>
 </p>
 </div>
 ))}
 </div>
 <div
 className={`map-container ${mapExpanded ? 'expanded' : 'collapsed'}`}
 onClick={toggleMapSize}
 >
 <iframe
 title="Order Map"
 width="100%"
 height="100%"
 style={{ border: 0 }}
 loading="lazy"
 src="https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=India"
 ></iframe>
 {!mapExpanded && <div className="map-overlay">녟녠녡녢녣 Click to Expand Map</div>}
 </div>
 </div>
 );
};
export default Dashboard;