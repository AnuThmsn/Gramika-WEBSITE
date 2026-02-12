import React, { useEffect, useState } from 'react';
import './Order.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

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

  const handleStatusChange = async (orderId, newStatus) => {
    const token = localStorage.getItem('gramika_token');
    if (!token) {
      alert('Not authorized');
      return;
    }

    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to update order: ${err.msg || 'Unknown error'}`);
        return;
      }

      const updatedOrder = await res.json();
      
      // Update local state
      setOrders(prev =>
        prev.map(o => (o._id === orderId ? updatedOrder : o))
      );

      alert(`✅ Order status updated to ${newStatus}`);
      window.dispatchEvent(new Event('orderUpdated'));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Could not update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'delivered': return 'status-delivered';
      case 'pending': return 'status-pending';
      case 'processing': return 'status-processing';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered': return '✅';
      case 'pending': return '⏳';
      case 'processing': return '🔄';
      case 'cancelled': return '❌';
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
                      <div className="action-buttons" style={{ display: 'flex', gap: '8px', flexDirection: 'column', alignItems: 'center' }}>
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          disabled={updatingOrderId === order._id}
                          style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: '1px solid #ddd',
                            fontSize: '14px',
                            cursor: updatingOrderId === order._id ? 'not-allowed' : 'pointer',
                            opacity: updatingOrderId === order._id ? 0.6 : 1
                          }}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        {updatingOrderId === order._id && <span style={{ fontSize: '12px', color: '#666' }}>Updating...</span>}
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