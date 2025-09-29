import React from 'react';
import './Order.css';

const Orders = () => {
  const orders = [
    {
      id: '#ORD001',
      customerName: 'Rahul Sharma',
      items: 'Milk, Eggs, Bread',
      amount: 150,
      status: 'delivered',
      paymentMethod: 'UPI',
      orderDate: '2024-01-15'
    },
    {
      id: '#ORD002',
      customerName: 'Priya Singh',
      items: 'Chicken, Rice',
      amount: 350,
      status: 'pending',
      paymentMethod: 'Cash on Delivery',
      orderDate: '2024-01-16'
    },
    {
      id: '#ORD003',
      customerName: 'Amit Kumar',
      items: 'Chocolates, Fruits',
      amount: 280,
      status: 'processing',
      paymentMethod: 'Card',
      orderDate: '2024-01-16'
    }
  ];

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
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Amount</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">{order.id}</td>
                <td>{order.customerName}</td>
                <td className="items-cell">{order.items}</td>
                <td className="amount-cell">₹{order.amount}</td>
                <td>{order.paymentMethod}</td>
                <td>{order.orderDate}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)} {order.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn-view">👁️</button>
                    <button className="btn-edit">✏️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;