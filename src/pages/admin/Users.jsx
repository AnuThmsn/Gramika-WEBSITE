import React, { useState } from "react";
import {
  Card,
  Table,
  Button,
  Badge,
  Row,
  Col,
  Form,
  InputGroup,
} from "react-bootstrap";
import { ArrowLeftCircle } from "react-bootstrap-icons";

const Users = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [filterKYC, setFilterKYC] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const users = [
    { id: 1, name: "Gopika PS", email: "gopika@example.com", phone: "+91 98765 11111", kyc: "Approved", status: "Active" },
    { id: 2, name: "Anu", email: "anu@example.com", phone: "+91 98765 43210", kyc: "Pending", status: "Active" },
    { id: 3, name: "Rahul", email: "rahul@example.com", phone: "+91 99887 12345", kyc: "Rejected", status: "Banned" },
  ];

  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);

    const matchKYC = filterKYC === "All" || u.kyc === filterKYC;
    const matchStatus = filterStatus === "All" || u.status === filterStatus;

    return matchSearch && matchKYC && matchStatus;
  });

  return (
    <div className="container mt-4">
      {!selectedUser && (
        <Card className="p-3 shadow-sm mb-3">
          <h4>User Management</h4>

          <InputGroup className="my-3">
            <Form.Control
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Select value={filterKYC} onChange={(e) => setFilterKYC(e.target.value)}>
                <option value="All">Filter by KYC (All)</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">Filter by Account Status (All)</option>
                <option value="Active">Active</option>
                <option value="Banned">Banned</option>
              </Form.Select>
            </Col>
          </Row>

          <Table bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>KYC</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <Badge bg={user.kyc === "Approved" ? "success" : user.kyc === "Pending" ? "warning" : "danger"}>
                      {user.kyc}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg={user.status === "Active" ? "success" : "secondary"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td>
                    <Button size="sm" onClick={() => setSelectedUser(user)}>
                      View Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {selectedUser && (
        <Card className="p-4 shadow-sm position-relative">
          {/* BACK BUTTON AND HEADER */}
          <div className="d-flex align-items-center mb-3">
            <Button
              variant="light"
              size="sm"
              className="rounded-circle shadow-sm me-3"
              onClick={() => setSelectedUser(null)}
            >
              <ArrowLeftCircle size={24} />
            </Button>
            <h4 className="mb-0">{selectedUser.name}</h4>
          </div>

          <Row className="mt-3">
            {/* LEFT COLUMN */}
            <Col md={6}>
              <p className="text-start"><strong>Email:</strong> {selectedUser.email}</p>
              <p className="text-start"><strong>Phone:</strong> {selectedUser.phone}</p>
              <p className="text-start"><strong>Joined:</strong> 2024-08-12</p>
              <p className="text-start"><strong>Last Active:</strong> 2025-11-15</p>
              <p className="text-start"><strong>Account Type:</strong> User</p>

              <h5 className="mt-4 text-start">Saved Addresses</h5>
              <p className="text-start">
                <strong>Home</strong><br />
                No. 12, Gramika Lane, Green Valley<br />
                Chennai, Tamil Nadu - 600001
              </p>

              <h5 className="mt-4 text-start">Seller Information</h5>
              <p className="text-start"><strong>Shop Name:</strong> Gramika Store</p>
              <p className="text-start"><strong>Category:</strong> Handicrafts</p>
              <p className="text-start"><strong>Business Email:</strong> seller@example.com</p>
              <p className="text-start"><strong>Phone:</strong> +91 98765 43210</p>
              <p className="text-start"><strong>Business Address:</strong> No. 12, Gramika Lane, Green Valley, Chennai - 600001</p>
              <p className="text-start"><strong>KYC Document:</strong> <a href="#">View Document</a></p>
              <p className="text-start"><strong>License Document:</strong> <a href="#">View License</a></p>
              <p className="text-start"><strong>Intent to Sell:</strong> Yes</p>
            </Col>

            {/* RIGHT COLUMN */}
            <Col md={6}>
              {/* KYC Actions */}
              <Card className="p-3 shadow-sm mb-3">
                <h5 className="text-start mb-3">KYC Actions</h5>
                <Button className="my-2 w-100" variant="success">
                  Approve KYC
                </Button>
                <Button className="my-2 w-100" variant="danger">
                  Reject KYC
                </Button>
              </Card>

              {/* Account Actions */}
              <Card className="p-3 shadow-sm mb-4">
                <h5 className="text-start mb-3">Account Actions</h5>
                <Button className="my-2 w-100" variant="warning">
                  Ban User
                </Button>
                <Button className="my-2 w-100" variant="primary">
                  Activate User
                </Button>
              </Card>

              {/* Order History Summary */}
              <Card className="p-3 shadow-sm">
                <h5 className="text-start mb-3">Order History Summary</h5>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>#1022</td>
                      <td>Handmade Soap</td>
                      <td>₹150</td>
                      <td><Badge bg="success">Delivered</Badge></td>
                      <td>14 Nov 2025</td>
                    </tr>
                    <tr>
                      <td>#1056</td>
                      <td>Cotton Bag</td>
                      <td>₹250</td>
                      <td><Badge bg="info">Shipped</Badge></td>
                      <td>19 Nov 2025</td>
                    </tr>
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Users;