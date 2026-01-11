import React, { useEffect, useState } from "react";
import { Card, Row, Col, Table } from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

const Dashboard = () => {
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentOrders, setRecentOrders] = useState([]);
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
        setTotalUsers(data.userCount || 0);
        setTotalProducts(data.productCount || 0);
      } catch (err) {
        console.error('Failed to fetch admin stats', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const fetchRecentOrders = async () => {
      try {
        const token = localStorage.getItem('gramika_token');
        const res = await fetch('/api/orders/admin', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
        if (!res.ok) throw new Error('Failed to load orders');
        const orders = await res.json();
        if (!mounted) return;
        // Sort by createdAt descending and take first 5
        const sorted = orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
        setRecentOrders(sorted);
      } catch (err) {
        console.error('Failed to fetch recent orders', err);
      }
    };

    fetchStats();
    fetchRecentOrders();
    return () => { mounted = false; };
  }, []);

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
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Orders</Card.Title>
              <h4>{totalOrders}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Users</Card.Title>
              <h4>{totalUsers}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Total Products</Card.Title>
              <h4>{totalProducts}</h4>
            </Card.Body>
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
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.slice(-6)}</td>
                  <td>{order.user?.name || 'Unknown'}</td>
                  <td>{order.items?.[0]?.name || 'N/A'}</td>
                  <td>{order.items?.[0]?.quantity || 0}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">No recent orders</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default Dashboard;