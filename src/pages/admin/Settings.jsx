import React, { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
// Using react-icons (removed BsMoonStars as it is no longer needed)
import { BsGear, BsPersonCircle, BsSave } from "react-icons/bs";

const Settings = () => {
  // Marketplace Settings
  const [commission, setCommission] = useState(5);
  const [shipping, setShipping] = useState(50);

  // Profile Settings
  const [name, setName] = useState("Anu Thomson");
  const [email, setEmail] = useState("admin@gramika.com");
  const [password, setPassword] = useState("");
  const [role] = useState("Super Admin"); // Read-only role

  const handleMarketplaceSave = (e) => {
    e.preventDefault();
    alert("Marketplace Settings Updated!");
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    alert("Admin Profile Updated!");
  };

  return (
    <div style={{ padding: "24px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <h2 className="mb-4 fw-bold d-flex align-items-center gap-2">
        <BsGear size={28} /> Settings
      </h2>

      <Row>
        {/* Marketplace Settings */}
        <Col md={6}>
          <Card className="shadow-sm mb-4 border-0">
            <Card.Body>
              <Card.Title className="fw-bold d-flex align-items-center gap-2 mb-3">
                <BsGear size={20} /> Marketplace Configuration
              </Card.Title>
              <hr className="text-muted" />

              <Form onSubmit={handleMarketplaceSave}>
                <Form.Group className="mb-3">
                  <Form.Label>Commission Rate (%)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    max="100"
                    value={commission}
                    onChange={(e) => setCommission(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Percentage taken from each sale.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Flat Shipping Fee (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={shipping}
                    onChange={(e) => setShipping(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 d-flex align-items-center justify-content-center gap-2">
                  <BsSave /> Save Changes
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Admin Profile Settings */}
        <Col md={6}>
          <Card className="shadow-sm mb-4 border-0">
            <Card.Body>
              <Card.Title className="fw-bold d-flex align-items-center gap-2 mb-3">
                <BsPersonCircle size={20} /> Admin Profile
              </Card.Title>
              <hr className="text-muted" />

              {/* Display Profile Details Section */}
              <div className="d-flex align-items-center mb-4 p-3 bg-light rounded">
                <div 
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                  style={{ width: "60px", height: "60px", marginRight: "15px" }}
                >
                   <BsPersonCircle size={32} color="#6c757d" />
                </div>
                <div>
                  <h5 className="mb-0 fw-bold">{name}</h5>
                  <div className="text-muted small">{role}</div>
                  <div className="text-success small">● Online</div>
                </div>
              </div>

              <Form onSubmit={handleProfileSave}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label>Change Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100 d-flex align-items-center justify-content-center gap-2">
                  <BsSave /> Update Profile
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Settings;