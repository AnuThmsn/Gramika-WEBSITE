import React from "react";
import * as XLSX from "xlsx";
import "./MonthlySellHistory.css";
const monthlyData = [
 { month: "January", totalOrders: 45, totalRevenue: "₹12,000" },
 { month: "February", totalOrders: 32, totalRevenue: "₹9,500" },
 { month: "March", totalOrders: 50, totalRevenue: "₹15,200" },
 { month: "April", totalOrders: 38, totalRevenue: "₹11,000" },
 { month: "May", totalOrders: 44, totalRevenue: "₹13,400" },
 { month: "June", totalOrders: 36, totalRevenue: "₹10,800" },
 { month: "July", totalOrders: 41, totalRevenue: "₹12,900" },
 { month: "August", totalOrders: 39, totalRevenue: "₹11,700" },
 { month: "September", totalOrders: 48, totalRevenue: "₹14,100" },
 { month: "October", totalOrders: 35, totalRevenue: "₹10,500" },
 { month: "November", totalOrders: 40, totalRevenue: "₹12,300" },
 { month: "December", totalOrders: 55, totalRevenue: "₹16,800" },
];
const MonthlySellHistory = () => {
 const handleDownloadExcel = () => {
 const worksheet = XLSX.utils.json_to_sheet(monthlyData);
 const workbook = XLSX.utils.book_new();
 XLSX.utils.book_append_sheet(workbook, worksheet, "Sell History");
 XLSX.writeFile(workbook, "Monthly_Sell_History.xlsx");
 };
 return (
 <div className="monthly-history-container">
 <h2 className="monthly-heading">Monthly Sell History</h2>
 <div className="card-grid">
 {monthlyData.map((data, index) => (
 <div className="monthly-card" key={index}>
 <h3>{data.month}</h3>
 <p>Orders: {data.totalOrders}</p>
 <p>Revenue: {data.totalRevenue}</p>
 </div>
 ))}
 </div>
 <div className="download-btn-container">
 <button className="download-excel-btn" onClick={handleDownloadExcel}>
 Download Excel
 </button>
 </div>
 </div>
 );
};
export default MonthlySellHistory; 