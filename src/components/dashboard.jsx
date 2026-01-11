import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { FaBox, FaMoneyBillWave, FaHourglassHalf } from 'react-icons/fa';
import { MdOutlineShowChart } from 'react-icons/md';

const Dashboard = () => {
  const [stats, setStats] = useState([
    { label: 'Total Products', value: '0', icon: <FaBox /> },
    { label: 'Total Sales', value: '₹0', icon: <FaMoneyBillWave /> },
    { label: 'Pending Orders', value: '0', icon: <FaHourglassHalf /> },
    { label: 'This Month', value: '₹0', icon: <MdOutlineShowChart /> }
  ]);

  const [salesData, setSalesData] = useState([]);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('gramika_token');
      if (!token) return;

      try {
        const res = await fetch('/api/users/seller/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStats([
            { label: 'Total Products', value: data.totalProducts.toString(), icon: <FaBox /> },
            { label: 'Total Sales', value: `₹${data.totalSales.toFixed(2)}`, icon: <FaMoneyBillWave /> },
            { label: 'Pending Orders', value: data.pendingOrders.toString(), icon: <FaHourglassHalf /> },
            { label: 'This Month', value: `₹${data.monthlyData[data.monthlyData.length - 1]?.sales.toFixed(2) || '0'}`, icon: <MdOutlineShowChart /> }
          ]);
          setSalesData(data.monthlyData.map(m => ({ month: m.label, sales: m.sales })));
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

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