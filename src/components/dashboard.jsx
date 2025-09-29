import React from 'react';
import './dashboard.css';
import { FaBox, FaMoneyBillWave, FaHourglassHalf } from 'react-icons/fa';
import { MdOutlineShowChart } from 'react-icons/md';

const Dashboard = () => {
  const stats = [
    { label: 'Total Products', value: '125', icon: <FaBox /> },
    { label: 'Total Sales', value: '₹85,420', icon: <FaMoneyBillWave /> },
    { label: 'Pending Orders', value: '23', icon: <FaHourglassHalf /> },
    { label: 'This Month', value: '₹12,450', icon: <MdOutlineShowChart /> }
  ];

  const salesData = [
    { month: 'Jan', sales: 15000 },
    { month: 'Feb', sales: 22000 },
    { month: 'Mar', sales: 18000 },
    { month: 'Apr', sales: 25000 },
    { month: 'May', sales: 30000 },
    { month: 'Jun', sales: 28000 }
  ];

  const exportToExcel = () => {
    alert('Exporting monthly status to Excel...');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <button className="btn-primary" onClick={exportToExcel}>
          <MdOutlineShowChart /> Export Monthly Report
        </button>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 className="chart-title">Sales Trend (Last 6 Months)</h3>
        <div className="chart-container">
          {salesData.map((data, index) => (
            <div key={index} className="chart-bar">
              <div 
                className="bar" 
                style={{height: `${(data.sales / 30000) * 100}%`}}
              ></div>
              <div className="bar-label">{data.month}</div>
              <div className="bar-value">₹{data.sales.toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;