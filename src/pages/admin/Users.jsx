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
  const [filterSeller, setFilterSeller] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH FULL USER ---------------- */
  const fetchUserDetails = async (userId) => {
    const token = localStorage.getItem("gramika_token");
    if (!token) return;

    try {
      const res = await fetch(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const user = await res.json();
        setFullUserDetails(user);
      }
    } catch (err) {
      console.error("Failed to fetch user details:", err);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    fetchUserDetails(user.id);
  };

  /* ---------------- SELLER APPROVAL ---------------- */
  const handleApproveSeller = async () => {
    if (!fullUserDetails?.seller) return;
    const token = localStorage.getItem("gramika_token");

    try {
      const res = await fetch(`/api/users/seller/${fullUserDetails._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "verified" }),
      });

      if (res.ok) {
        alert("Seller Approved");
        setFullUserDetails({
          ...fullUserDetails,
          seller: { ...fullUserDetails.seller, status: "verified" },
        });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === fullUserDetails._id
              ? { ...u, sellerStatus: "Verified" }
              : u
          )
        );
      } else {
        alert("Failed to approve seller");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectSeller = async () => {
    if (!fullUserDetails?.seller) return;
    const token = localStorage.getItem("gramika_token");

    try {
      const res = await fetch(`/api/users/seller/${fullUserDetails._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (res.ok) {
        alert("Seller Rejected");
        setFullUserDetails({
          ...fullUserDetails,
          seller: { ...fullUserDetails.seller, status: "rejected" },
        });
        setUsers((prev) =>
          prev.map((u) =>
            u.id === fullUserDetails._id
              ? { ...u, sellerStatus: "Rejected" }
              : u
          )
        );
      } else {
        alert("Failed to reject seller");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* ---------------- FETCH USERS LIST ---------------- */
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("gramika_token");
      if (!token) return;

      try {
        const res = await fetch("/api/users/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const data = await res.json();
          const formatted = data.map((u) => ({
            id: u._id,
            name: u.name || "Unknown",
            email: u.email,
            phone: u.phone || "N/A",
            sellerStatus:
              u.seller?.status === "verified"
                ? "Verified"
                : u.seller?.status === "pending"
                ? "Pending"
                : u.seller?.status === "rejected"
                ? "Rejected"
                : "Not Applied",
            status: u.isAdmin ? "Admin" : "Active",
          }));
          setUsers(formatted);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  /* ---------------- FILTER ---------------- */
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.phone.includes(search);

    const matchSeller =
      filterSeller === "All" || u.sellerStatus === filterSeller;
    const matchStatus =
      filterStatus === "All" || u.status === filterStatus;

    return matchSearch && matchSeller && matchStatus;
  });

  /* ---------------- RENDER ---------------- */
  return (
    <div className="container mt-4">
      {!selectedUser && (
        <Card className="p-3 shadow-sm">
          <h4>Seller Approval</h4>

          <InputGroup className="my-3">
            <Form.Control
              placeholder="Search by name, email, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Select
                value={filterSeller}
                onChange={(e) => setFilterSeller(e.target.value)}
              >
                <option value="All">All Seller Status</option>
                <option value="Pending">Pending</option>
                <option value="Verified">Verified</option>
                <option value="Rejected">Rejected</option>
                <option value="Not Applied">Not Applied</option>
              </Form.Select>
            </Col>

            <Col md={4}>
              <Form.Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="All">All Account Status</option>
                <option value="Active">Active</option>
              </Form.Select>
            </Col>
          </Row>

          <Table bordered hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Seller Status</th>
                <th>Account</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <Badge
                      bg={
                        u.sellerStatus === "Verified"
                          ? "success"
                          : u.sellerStatus === "Pending"
                          ? "warning"
                          : u.sellerStatus === "Rejected"
                          ? "danger"
                          : "secondary"
                      }
                    >
                      {u.sellerStatus}
                    </Badge>
                  </td>
                  <td>
                    <Badge bg="success">{u.status}</Badge>
                  </td>
                  <td>
                    <Button size="sm" onClick={() => handleViewDetails(u)}>
                      View Application
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card>
      )}

      {/* ---------------- DETAILS VIEW ---------------- */}
      {selectedUser && fullUserDetails && (
        <Card className="p-4 shadow-sm">
          <Button
            variant="light"
            size="sm"
            onClick={() => {
              setSelectedUser(null);
              setFullUserDetails(null);
            }}
          >
            <ArrowLeftCircle size={22} /> Back
          </Button>

          <Row className="mt-3">
            <Col md={6}>
              <h5>User Info</h5>
              <p><strong>Email:</strong> {fullUserDetails.email}</p>
              <p><strong>Phone:</strong> {fullUserDetails.phone}</p>
              <p><strong>Address:</strong> {fullUserDetails.address}</p>

              <h5 className="mt-4">Seller Application</h5>

              {fullUserDetails.seller ? (
                <>
                  <p><strong>Name:</strong> {fullUserDetails.seller.name}</p>
                  <p><strong>Email:</strong> {fullUserDetails.seller.email}</p>
                  <p><strong>Phone:</strong> {fullUserDetails.seller.phone}</p>
                  <p><strong>Address:</strong> {fullUserDetails.seller.address}</p>
                  <p><strong>Items:</strong> {fullUserDetails.seller.sellItems.join(", ")}</p>

                  <p>
                    <strong>Aadhar:</strong>{" "}
                    {fullUserDetails.seller?.aadharFileId ? (
                      <a
                        href={`/api/uploads/id/${fullUserDetails.seller.aadharFileId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : fullUserDetails.seller?.aadharFileName ? (
                      <a
                        href={`/api/uploads/file/${encodeURIComponent(fullUserDetails.seller.aadharFileName)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted">Not uploaded</span>
                    )}
                  </p>

                  <p>
                    <strong>License:</strong>{" "}
                    {fullUserDetails.seller?.licenseFileId ? (
                      <a
                        href={`/api/uploads/id/${fullUserDetails.seller.licenseFileId}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : fullUserDetails.seller?.licenseFileName ? (
                      <a
                        href={`/api/uploads/file/${encodeURIComponent(fullUserDetails.seller.licenseFileName)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View
                      </a>
                    ) : (
                      <span className="text-muted">Not uploaded</span>
                    )}
                  </p>

                  <Badge bg="warning">
                    {fullUserDetails.seller.status}
                  </Badge>
                </>
              ) : (
                <p>No seller application</p>
              )}
            </Col>

            <Col md={6}>
              <Card className="p-3">
                <h5>Seller Approval Actions</h5>
                <Button
                  className="w-100 my-2"
                  variant="success"
                  disabled={fullUserDetails.seller?.status === "verified"}
                  onClick={handleApproveSeller}
                >
                  Approve Seller
                </Button>
                <Button
                  className="w-100"
                  variant="danger"
                  onClick={handleRejectSeller}
                >
                  Reject Seller
                </Button>
              </Card>
            </Col>
          </Row>
        </Card>
      )}
    </div>
  );
};

export default Users;
