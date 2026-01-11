import React, { useEffect, useState } from 'react';
import './Order.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('gramika_token');
        if (!token) { if (mounted) setOrders([]); return; }
        const res = await fetch('/api/orders/seller', { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        if (mounted) setOrders(data || []);
      } catch (err) {
        console.error(err);
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    const onUpdated = () => load();
    window.addEventListener('orderUpdated', onUpdated);
    return () => { mounted = false; window.removeEventListener('orderUpdated', onUpdated); };
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      default: return '';
    }
  };

  return (
    <div className="orders">
      <div className="section-header">
        <h1 className="section-title">Orders</h1>
      </div>

      <div className="orders-table-container">
        {loading ? <p>Loading orders…</p> : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan={7}>No orders found.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id || order.id}>
                    <td className="order-id">{(order._id || '').slice(-6).toUpperCase()}</td>
                    <td>{order.user?.name || order.user?.email || (order.user || 'Customer')}</td>
                    <td className="items-cell">{(order.items || []).map(it => `${it.name || (it.product && it.product.name) || ''} x${it.quantity}`).join(', ')}</td>
                    <td className="amount-cell">₹{order.total}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-view">👁️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Orders;