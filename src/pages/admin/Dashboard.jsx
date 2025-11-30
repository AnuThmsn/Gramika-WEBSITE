import React from "react";
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
  // Revenue Data (Line Chart)
  const revenueData = [
    { month: "Jan", revenue: 800 },
    { month: "Feb", revenue: 1200 },
    { month: "Mar", revenue: 900 },
    { month: "Apr", revenue: 1500 },
    { month: "May", revenue: 1700 },
    { month: "Jun", revenue: 2200 },
  ];

  // Orders Data (Bar Chart)
  const orderData = [
    { day: "Mon", orders: 40 },
    { day: "Tue", orders: 35 },
    { day: "Wed", orders: 50 },
    { day: "Thu", orders: 30 },
    { day: "Fri", orders: 60 },
  ];

  // User Distribution (Pie Chart)
  const userTypeData = [
    { name: "Buyers", value: 80 },
    { name: "Sellers", value: 40 },
  ];

  const COLORS = ["#0088FE", "#FF7F50"];

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Admin Dashboard</h2>

      {/* TOP CARDS */}
      <Row className="mb-4">
        {[
          { title: "Total Users", value: "120" },
          { title: "Pending Verifications", value: "5" },
          { title: "Orders Today", value: "45" },
          { title: "Revenue", value: "₹1,200" },
        ].map((card, i) => (
          <Col md={3} key={i}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <Card.Title>{card.title}</Card.Title>
                <h4>{card.value}</h4>
              </Card.Body>
            </Card>
          </Col>
        ))}
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
                    <Cell key={index} fill={COLORS[index]} />
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