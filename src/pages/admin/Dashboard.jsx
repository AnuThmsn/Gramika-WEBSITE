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
  const [sellerCount, setSellerCount] = useState(0);
  const [buyerCount, setBuyerCount] = useState(0);
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
        setSellerCount(data.sellerCount || 0);
        setBuyerCount(data.buyerCount || 0);
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
        
        // Filter orders from today only
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayOrders = orders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate >= today && orderDate < tomorrow;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        setRecentOrders(todayOrders);
      } catch (err) {
        console.error('Failed to fetch recent orders', err);
      }
    };

    fetchStats();
    fetchRecentOrders();
    return () => { mounted = false; };
  }, []);

  // User distribution data from actual counts
  const userTypeData = [
    { name: "Buyers", value: buyerCount },
    { name: "Sellers", value: sellerCount },
  ].filter(item => item.value > 0);

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

      {/* SELLER AND BUYER COUNTS */}
      <Row className="mb-4">
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Sellers</Card.Title>
              <h4>{sellerCount}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title>Buyers</Card.Title>
              <h4>{buyerCount}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* PIE CHART */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="p-3 shadow-sm">
            <h5>User Type Distribution</h5>
            {userTypeData.length > 0 ? (
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
            ) : (
              <p className="text-center text-muted">No user data available</p>
            )}
          </Card>
        </Col>
      </Row>

      {/* RECENT ORDERS TABLE */}
      <h4 className="mt-4">Orders Today</h4>
      <Card className="shadow-sm p-3">
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Item</th>
              <th>Quantity</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.slice(-6).toUpperCase()}</td>
                  <td>{order.user?.name || 'Unknown'}</td>
                  <td>{order.items?.[0]?.name || 'N/A'}</td>
                  <td>{order.items?.[0]?.quantity || 0}</td>
                  <td>₹{order.total || 0}</td>
                  <td><span style={{ textTransform: 'capitalize' }}>{order.status || 'pending'}</span></td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="text-center">No recent orders</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
};

export default Dashboard;