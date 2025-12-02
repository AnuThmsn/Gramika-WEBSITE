import React, { useState } from "react";
import { Card, Row, Col, Table, Button, Badge } from "react-bootstrap";

const Payouts = () => {
  // Light green color for backgrounds (kept for table consistency)
  const lightGreen = "#e8f5e8";

  // Social program commission rate (only 2%)
  const COMMISSION_RATE = 0.02;

  // Transaction Log
  const [transactions] = useState([
    {
      id: "TX001",
      buyer: "Aisha",
      seller: "Meera Stores",
      amount: 2000,
      method: "UPI",
      date: "2025-11-20",
      status: "Success",
    },
    {
      id: "TX002",
      buyer: "Ravi",
      seller: "Fresh Veggies",
      amount: 450,
      method: "Card",
      date: "2025-11-21",
      status: "Success",
    },
    {
      id: "TX003",
      buyer: "Priya",
      seller: "Organic Farms",
      amount: 3200,
      method: "UPI",
      date: "2025-11-22",
      status: "Success",
    },
  ]);

  // Payouts - recalculated with 2% commission
  const [payouts, setPayouts] = useState([
    {
      seller: "Meera Stores",
      total: 2000,
      commission: 40, // 2% of 2000
      payable: 1960, // 2000 - 40
      status: "Pending",
    },
    {
      seller: "Fresh Veggies",
      total: 450,
      commission: 9, // 2% of 450
      payable: 441, // 450 - 9
      status: "Pending",
    },
    {
      seller: "Organic Farms",
      total: 3200,
      commission: 64, // 2% of 3200
      payable: 3136, // 3200 - 64
      status: "Paid",
    },
  ]);

  // Refund Requests
  const [refunds, setRefunds] = useState([
    {
      id: "RF001",
      buyer: "Neha",
      seller: "Meera Stores",
      amount: 1200,
      reason: "Damaged item",
      status: "Pending",
    },
  ]);

  const handleMarkAsPaid = (sellerName) => {
    setPayouts((prev) =>
      prev.map((p) =>
        p.seller === sellerName ? { ...p, status: "Paid" } : p
      )
    );
  };

  const approveRefund = (id) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r))
    );
  };

  const rejectRefund = (id) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r))
    );
  };

  // Calculate totals
  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const totalCommission = payouts.reduce((sum, p) => sum + p.commission, 0);
  const totalPayouts = payouts.reduce((sum, p) => sum + p.payable, 0);
  const pendingPayouts = payouts.filter(p => p.status === "Pending").reduce((sum, p) => sum + p.payable, 0);

  return (
    <div style={{ padding: "24px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* Header Section */}
      <div className="mb-4">
        
        {/* UPDATED: Simplified heading to match Dashboard style */}
        <h2 className="mb-4">Financial Management</h2>

        {/* Stats Cards */}
        <Row className="g-3">
          <Col md={3}>
            <Card style={{ borderLeft: `4px solid #198754`, borderTop: "none", borderRight: "none", borderBottom: "none" }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Total Gross Sales</h6>
                    <h4 style={{ color: "#198754", fontWeight: 700 }}>₹{totalRevenue}</h4>
                    <small className="text-success">{transactions.length} transactions</small>
                  </div>
                  <div style={{ backgroundColor: lightGreen, padding: "12px", borderRadius: "8px" }}>
                    <i className="bi bi-graph-up" style={{ fontSize: "1.5rem", color: "#198754" }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card style={{ borderLeft: `4px solid #6c757d`, borderTop: "none", borderRight: "none", borderBottom: "none" }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Platform Earnings</h6>
                    <h4 style={{ color: "#6c757d", fontWeight: 700 }}>₹{totalCommission}</h4>
                    <small className="text-muted">Only {COMMISSION_RATE * 100}% for operations</small>
                  </div>
                  <div style={{ backgroundColor: "#f8f9fa", padding: "12px", borderRadius: "8px" }}>
                    <i className="bi bi-heart" style={{ fontSize: "1.5rem", color: "#6c757d" }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card style={{ borderLeft: `4px solid #0d6efd`, borderTop: "none", borderRight: "none", borderBottom: "none" }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Seller Earnings</h6>
                    <h4 style={{ color: "#0d6efd", fontWeight: 700 }}>₹{totalPayouts}</h4>
                    <small className="text-info">{payouts.length} local sellers</small>
                  </div>
                  <div style={{ backgroundColor: "#e7f1ff", padding: "12px", borderRadius: "8px" }}>
                    <i className="bi bi-people" style={{ fontSize: "1.5rem", color: "#0d6efd" }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card style={{ borderLeft: `4px solid #fd7e14`, borderTop: "none", borderRight: "none", borderBottom: "none" }}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted mb-1">Pending Payouts</h6>
                    <h4 style={{ color: "#fd7e14", fontWeight: 700 }}>₹{pendingPayouts}</h4>
                    <small className="text-warning">{payouts.filter(p => p.status === "Pending").length} pending</small>
                  </div>
                  <div style={{ backgroundColor: "#fff3cd", padding: "12px", borderRadius: "8px" }}>
                    <i className="bi bi-clock" style={{ fontSize: "1.5rem", color: "#fd7e14" }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <Row className="g-4">
        {/* Transaction Log */}
        <Col lg={6}>
          <Card className="h-100" style={{ border: "1px solid #dee2e6", borderRadius: "12px" }}>
            <Card.Header style={{ backgroundColor: "transparent", borderBottom: "1px solid #dee2e6" }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 style={{ fontWeight: 600, color: "#198754", margin: 0 }}>
                  <i className="bi bi-list-check me-2"></i>
                  Transaction Log
                </h5>
                <Badge bg="light" text="dark">{transactions.length}</Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                <Table hover className="mb-0">
                  <thead style={{ backgroundColor: lightGreen }}>
                    <tr>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Transaction</th>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Amount</th>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((t) => (
                      <tr key={t.id} style={{ borderBottom: "1px solid #f1f3f4" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{t.id}</div>
                            <small className="text-muted">{t.buyer} → {t.seller}</small>
                            <div>
                              <small className="text-muted">{t.method} • {t.date}</small>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#198754" }}>
                          ₹{t.amount}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge 
                            bg="success" 
                            style={{ 
                              fontSize: "0.75rem", 
                              padding: "4px 8px",
                              fontWeight: 500 
                            }}
                          >
                            {t.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Payouts & Refunds Side by Side */}
        <Col lg={6}>
          {/* Seller Payouts */}
          <Card className="mb-4" style={{ border: "1px solid #dee2e6", borderRadius: "12px" }}>
            <Card.Header style={{ backgroundColor: "transparent", borderBottom: "1px solid #dee2e6" }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 style={{ fontWeight: 600, color: "#0d6efd", margin: 0 }}>
                  <i className="bi bi-cash-coin me-2"></i>
                  Seller Payouts
                </h5>
                <div>
                  <Badge bg="light" text="dark" style={{ fontSize: "0.75rem" }}>
                    Only {COMMISSION_RATE * 100}% fee
                  </Badge>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <Table hover className="mb-0">
                  <thead style={{ backgroundColor: "#e7f1ff" }}>
                    <tr>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Seller</th>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Payable</th>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Fee</th>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Status</th>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.seller} style={{ borderBottom: "1px solid #f1f3f4" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600, fontSize: "0.875rem" }}>
                          {p.seller}
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#198754" }}>
                          ₹{p.payable}
                        </td>
                        <td style={{ padding: "12px 16px", color: "#6c757d", fontSize: "0.875rem" }}>
                          ₹{p.commission}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge 
                            bg={p.status === "Pending" ? "warning" : "success"}
                            style={{ 
                              fontSize: "0.75rem", 
                              padding: "4px 8px",
                              fontWeight: 500 
                            }}
                          >
                            {p.status}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {p.status === "Pending" && (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleMarkAsPaid(p.seller)}
                              style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                            >
                              Pay
                            </Button>
                          )}
                          {p.status === "Paid" && (
                            <i className="bi bi-check-circle text-success"></i>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Refund Requests */}
          <Card style={{ border: "1px solid #dee2e6", borderRadius: "12px" }}>
            <Card.Header style={{ backgroundColor: "transparent", borderBottom: "1px solid #dee2e6" }}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 style={{ fontWeight: 600, color: "#dc3545", margin: 0 }}>
                  <i className="bi bi-arrow-counterclockwise me-2"></i>
                  Refund Requests
                </h5>
                <Badge bg="light" text="dark">{refunds.length}</Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                <Table hover className="mb-0">
                  <thead style={{ backgroundColor: "#ffe6e6" }}>
                    <tr>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Request</th>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Amount</th>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Status</th>
                      <th style={{ fontSize: "0.875rem", fontWeight: 600, padding: "12px 16px" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.map((r) => (
                      <tr key={r.id} style={{ borderBottom: "1px solid #f1f3f4" }}>
                        <td style={{ padding: "12px 16px" }}>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{r.id}</div>
                            <small className="text-muted">{r.buyer}</small>
                            <div>
                              <small className="text-muted">{r.reason}</small>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 600, color: "#dc3545" }}>
                          ₹{r.amount}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <Badge
                            bg={
                              r.status === "Pending"
                                ? "warning"
                                : r.status === "Approved"
                                ? "success"
                                : "danger"
                            }
                            style={{ 
                              fontSize: "0.75rem", 
                              padding: "4px 8px",
                              fontWeight: 500 
                            }}
                          >
                            {r.status}
                          </Badge>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {r.status === "Pending" && (
                            <div className="d-flex gap-1">
                              <Button
                                variant="outline-success"
                                size="sm"
                                onClick={() => approveRefund(r.id)}
                                style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                              >
                                ✓
                              </Button>
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => rejectRefund(r.id)}
                                style={{ fontSize: "0.75rem", padding: "4px 8px" }}
                              >
                                ✗
                              </Button>
                            </div>
                          )}
                          {r.status !== "Pending" && (
                            <i className={`bi bi-${r.status === "Approved" ? "check-circle text-success" : "x-circle text-danger"}`}></i>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Payouts;