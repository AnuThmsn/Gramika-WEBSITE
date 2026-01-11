import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Dashboard = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [monthlyProfitData, setMonthlyProfitData] = useState([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('gramika_token');
        const res = await fetch('/api/admin/stats', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!res.ok) throw new Error('Failed to load stats');
        const data = await res.json();
        if (!mounted) return;
        setTotalOrders(data.totalOrders || 0);
        setTotalRevenue(data.totalRevenue || 0);
        setTotalUsers(data.userCount || 0);
        setTotalProducts(data.productCount || 0);
        setRevenueData((data.month || []).map(m => ({ month: m.label, revenue: m.revenue })));
        setMonthlyProfitData((data.monthlyProfit || []).map(m => ({ month: m.label, profit: m.profit })));
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStats();
    return () => { mounted = false; };
  }, []);

  const orderData = revenueData.map((r, i) => ({ day: r.month, orders: 0 }));

  // User distribution placeholder (could be replaced with real data)
  const userTypeData = [
    { name: "Buyers", value: Math.max(0, totalUsers - 10) },
    { name: "Sellers", value: 10 },
  ];

  const COLORS = ["#0088FE", "#FF7F50"];

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* TOP CARDS */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Orders</Card.Title>
              <h4>{totalOrders}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Revenue</Card.Title>
              <h4>₹{totalRevenue.toLocaleString()}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Users</Card.Title>
              <h4>{totalUsers}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Products</Card.Title>
              <h4>{totalProducts}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* GRAPH SECTION */}
      <Row className="mt-4">
        {/* Line Chart */}
        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h5>Revenue Overview</h5>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#0088FE" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Bar Chart */}
        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h5>Orders This Week</h5>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={orderData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* PIE CHART */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h5>User Type Distribution</h5>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* RECENT ORDERS TABLE */}
      <h4 className="mt-4">Recent Orders</h4>
      <Card className="shadow-sm p-3">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>101</td>
              <td>Alice</td>
              <td>Rice</td>
              <td>10</td>
              <td>2025-11-01</td>
            </tr>
            <tr>
              <td>102</td>
              <td>Bob</td>
              <td>Wheat</td>
              <td>5</td>
              <td>2025-11-02</td>
            </tr>
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default Dashboard;