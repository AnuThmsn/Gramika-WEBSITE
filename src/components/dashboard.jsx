import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';

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
        const res = await fetch(`${API_BASE}/api/users/seller/stats`, {
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
    if (!salesData || salesData.length === 0) {
      alert('No data available to export');
      return;
    }

    const headers = ['Month', 'Sales (INR)'];
    const csvRows = [headers.join(',')];

    salesData.forEach((data) => {
      csvRows.push(`"${data.month}",${data.sales}`);
    });

    csvRows.push('');
    csvRows.push('Summary,Value');
    stats.forEach((s) => {
      csvRows.push(`"${s.label}","${s.value.replace('₹', '')}"`);
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'monthly_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          {(() => {
            const maxSales = Math.max(...salesData.map(d => d.sales), 100);
            return salesData.map((data, index) => (
              <div key={index} className="chart-bar">
                <div
                  className="bar"
                  style={{ height: `${(data.sales / maxSales) * 100}%` }}
                ></div>
                <div className="bar-label">{data.month}</div>
                <div className="bar-value">₹{data.sales.toLocaleString()}</div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;