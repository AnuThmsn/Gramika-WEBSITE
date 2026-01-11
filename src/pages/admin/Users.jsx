import React, { useState, useEffect } from "react";
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
  const [fullUserDetails, setFullUserDetails] = useState(null);
  const [search, setSearch] = useState("");
  const [filterKYC, setFilterKYC] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserDetails = async (userId) => {
    const token = localStorage.getItem('gramika_token');
    if (!token) return;
    try {
      const res = await fetch(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const user = await res.json();
        setFullUserDetails(user);
      }
    } catch (err) {
      console.error('Failed to fetch user details:', err);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user.id);
  };

  const handleApproveKYC = async () => {
    if (!fullUserDetails) return;
    const token = localStorage.getItem('gramika_token');
    try {
      const res = await fetch(`/api/users/seller/${fullUserDetails._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'verified' })
      });
      if (res.ok) {
        alert('KYC Approved');
        setFullUserDetails({ ...fullUserDetails, seller: { ...fullUserDetails.seller, status: 'verified' } });
        // Update the users list
        setUsers(users.map(u => u.id === fullUserDetails._id ? { ...u, kyc: 'Approved' } : u));
      } else {
        alert('Failed to approve KYC');
      }
    } catch (err) {
      console.error('Error approving KYC:', err);
      alert('Error approving KYC');
    }
  };

  const handleRejectKYC = async () => {
    if (!fullUserDetails) return;
    const token = localStorage.getItem('gramika_token');
    try {
      const res = await fetch(`/api/users/seller/${fullUserDetails._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: 'rejected' })
      });
      if (res.ok) {
        alert('KYC Rejected');
        setFullUserDetails({ ...fullUserDetails, seller: { ...fullUserDetails.seller, status: 'rejected' } });
        setUsers(users.map(u => u.id === fullUserDetails._id ? { ...u, kyc: 'Rejected' } : u));
      } else {
        alert('Failed to reject KYC');
      }
    } catch (err) {
      console.error('Error rejecting KYC:', err);
      alert('Error rejecting KYC');
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('gramika_token');
      if (!token) return;
      try {
        const res = await fetch('/api/users/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const formattedUsers = data.map(user => ({
            id: user._id,
            name: user.name || 'Unknown',
            email: user.email,
            phone: user.phone || 'N/A',
            kyc: user.seller?.status === 'verified' ? 'Approved' : user.seller?.status === 'pending' ? 'Pending' : user.seller?.status === 'rejected' ? 'Rejected' : user.seller ? 'Registered' : 'Not Applied',
            status: user.isAdmin ? 'Admin' : 'Active'
          }));
          setUsers(formattedUsers);
        }
      } catch (err) {
        console.error('Failed to fetch users:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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
                <option value="Registered">Registered</option>
                <option value="Not Applied">Not Applied</option>
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
                    <Button size="sm" onClick={() => handleViewDetails(user)}>
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
              onClick={() => { setSelectedUser(null); setFullUserDetails(null); }}
            >
              <ArrowLeftCircle size={24} />
            </Button>
            <h4 className="mb-0">{selectedUser.name}</h4>
          </div>

          <Row className="mt-3">
            <Col md={6}>
              <p className="text-start"><strong>Email:</strong> {fullUserDetails?.email || selectedUser.email}</p>
              <p className="text-start"><strong>Phone:</strong> {fullUserDetails?.phone || selectedUser.phone}</p>
              <p className="text-start"><strong>Joined:</strong> {fullUserDetails?.createdAt ? new Date(fullUserDetails.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p className="text-start"><strong>Last Active:</strong> {fullUserDetails?.updatedAt ? new Date(fullUserDetails.updatedAt).toLocaleDateString() : 'N/A'}</p>
              <p className="text-start"><strong>Account Type:</strong> {fullUserDetails?.isAdmin ? 'Admin' : 'User'}</p>

              <h5 className="mt-4 text-start">Saved Addresses</h5>
              <p className="text-start">
                {fullUserDetails?.address || 'No address provided'}
              </p>

              <h5 className="mt-4 text-start">Seller Information</h5>
              {fullUserDetails?.seller ? (
                <>
                  <p className="text-start"><strong>Name:</strong> {fullUserDetails.seller.shopName || 'N/A'}</p>
                  <p className="text-start"><strong>Email:</strong> {fullUserDetails.seller.businessEmail || 'N/A'}</p>
                  <p className="text-start"><strong>Phone:</strong> {fullUserDetails.seller.phone || 'N/A'}</p>
                  <p className="text-start"><strong>Address:</strong> {fullUserDetails.seller.address || 'N/A'}</p>
                  <p className="text-start"><strong>Aadhar Document:</strong> {fullUserDetails.seller.aadharFileName ? <a href="#" onClick={() => alert(`View Aadhar: ${fullUserDetails.seller.aadharFileName}`)}>View Aadhar</a> : 'Not uploaded'}</p>
                  <p className="text-start"><strong>License Document:</strong> {fullUserDetails.seller.licenseFileName ? <a href="#" onClick={() => alert(`View License: ${fullUserDetails.seller.licenseFileName}`)}>View License</a> : 'Not uploaded'}</p>
                  <p className="text-start"><strong>Intent to Sell:</strong> {fullUserDetails.seller.sellItems?.join(', ') || 'N/A'}</p>
                  <p className="text-start"><strong>Status:</strong> {fullUserDetails.seller.status}</p>
                </>
              ) : (
                <p className="text-start">Not registered as seller</p>
              )}
            </Col>

            {/* RIGHT COLUMN */}
            <Col md={6}>
              {/* KYC Actions */}
              <Card className="p-3 shadow-sm mb-3">
                <h5 className="text-start mb-3">KYC Actions</h5>
                <Button className="my-2 w-100" variant="success" onClick={handleApproveKYC} disabled={fullUserDetails?.seller?.status === 'verified'}>
                  Approve KYC
                </Button>
                <Button className="my-2 w-100" variant="danger" onClick={handleRejectKYC}>
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