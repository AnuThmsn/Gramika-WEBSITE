import React, { useState } from "react";
import { Card, Form, Button, Row, Col } from "react-bootstrap";
import { Gear, PersonCircle, MoonStars } from "react-bootstrap-icons";

const Settings = () => {
  const [commission, setCommission] = useState(5);
  const [shipping, setShipping] = useState(50);
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");

  // Theme setting: light, dark, system
  const [theme, setTheme] = useState("system");

  const handleMarketplaceSave = (e) => {
    e.preventDefault();
    alert("Marketplace Settings Updated!");
  };

  const handleProfileSave = (e) => {
    e.preventDefault();
    alert("Admin Profile Updated!");
  };

  const handleThemeSave = (e) => {
    e.preventDefault();
    alert(`Theme updated to: ${theme.toUpperCase()}`);

  };

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4 fw-bold d-flex align-items-center gap-2">
        <Gear size={28} /> Settings
      </h2>

      <Row>
        {/* Marketplace Settings */}
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title className="fw-bold d-flex align-items-center gap-2">
                <Gear size={22} /> Marketplace Settings
              </Card.Title>
              <hr />

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
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Shipping Fee (₹)</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    value={shipping}
                    onChange={(e) => setShipping(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Save Marketplace Settings
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Admin Profile Settings */}
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title className="fw-bold d-flex align-items-center gap-2">
                <PersonCircle size={24} /> Admin Profile
              </Card.Title>
              <hr />

              <Form onSubmit={handleProfileSave}>
                <Form.Group className="mb-3">
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Change Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" type="submit" className="w-100">
                  Update Profile
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Theme Settings */}
      <Row>
        <Col md={6}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <Card.Title className="fw-bold d-flex align-items-center gap-2">
                <MoonStars size={22} /> Theme Settings
              </Card.Title>
              <hr />

              <Form onSubmit={handleThemeSave}>
                <Form.Group>
                  <Form.Check
                    type="radio"
                    label="System Default"
                    name="theme"
                    value="system"
                    checked={theme === "system"}
                    onChange={(e) => setTheme(e.target.value)}
                  />

                  <Form.Check
                    type="radio"
                    className="mt-2"
                    label="Light Mode"
                    name="theme"
                    value="light"
                    checked={theme === "light"}
                    onChange={(e) => setTheme(e.target.value)}
                  />

                  <Form.Check
                    type="radio"
                    className="mt-2"
                    label="Dark Mode"
                    name="theme"
                    value="dark"
                    checked={theme === "dark"}
                    onChange={(e) => setTheme(e.target.value)}
                  />
                </Form.Group>

                <Button variant="primary" className="w-100 mt-3" type="submit">
                  Save Theme
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