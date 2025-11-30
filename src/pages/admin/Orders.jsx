import React, { useState } from "react";
import { Card, Row, Col, Table, Badge, Button, Modal, Form } from "react-bootstrap";
import { jsPDF } from "jspdf";

const Orders = () => {
  const [orders, setOrders] = useState([
    {
      id: 101, buyer: "Alice", seller: "Farmer John", items: [{ name: "Rice", qty: 2, price: 100 }],
      date: "2025-11-30", status: "Pending", shippingAddress: "123 Main St", paymentStatus: "Paid", trackingID: "TRK12345",
    },
    {
      id: 102, buyer: "Bob", seller: "Local Veggies", items: [{ name: "Tomatoes", qty: 1, price: 50 }],
      date: "2025-11-29", status: "Delivered", shippingAddress: "456 Park Ave", paymentStatus: "Paid", trackingID: "TRK12346",
    },
  ]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [newStatus, setNewStatus] = useState("");

  const statusColors = {
    Pending: "warning", Processing: "primary", Shipped: "info", 
    Delivered: "success", Cancelled: "danger"
  };

  // Dark green color matching sidebar
  const darkGreen = "#1a622bff";

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowModal(true);
  };

  const handleUpdateStatus = () => {
    if (!selectedOrder) return;
    setOrders(prev => prev.map(order => 
      order.id === selectedOrder.id ? { ...order, status: newStatus } : order
    ));
    setSelectedOrder({ ...selectedOrder, status: newStatus });
    setShowModal(false);
  };

  const generateInvoice = (order) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Invoice", 14, 22);
    doc.setFontSize(12);
    
    const details = [
      `Order ID: ${order.id}`, `Buyer: ${order.buyer}`, `Seller: ${order.seller}`,
      `Date: ${order.date}`, `Shipping: ${order.shippingAddress}`,
      `Payment: ${order.paymentStatus}`, `Tracking: ${order.trackingID}`
    ];
    
    details.forEach((text, i) => doc.text(text, 14, 32 + (i * 8)));
    
    let yPos = 90;
    doc.text("Items:", 14, yPos);
    order.items.forEach((item, i) => {
      doc.text(`${i+1}. ${item.name} - Qty: ${item.qty} - Price: ₹${item.price}`, 14, yPos + 8 * (i+1));
    });

    doc.save(`Invoice_Order_${order.id}.pdf`);
  };

  const filteredOrders = filterStatus === "All" ? orders : orders.filter(o => o.status === filterStatus);

  return (
    <div style={{ padding: "24px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* Header */}
      <Row className="mb-4 justify-content-center">
        <Col lg={10}>
          <Card style={{ 
            border: `2px solid ${darkGreen}`, 
            background: "linear-gradient(135deg, #1b492bff 0%, #1a622bff 100%)", 
            color: "white", 
            textAlign: "center", 
            padding: "32px", 
            borderRadius: "12px" 
          }}>
            <Card.Body className="p-0">
              <Row className="align-items-center">
                <Col md={12}>
                  <h2 style={{ fontWeight: 700, fontSize: "2.25rem", marginBottom: "8px" }}>Orders Management</h2>
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "16px" }}>
                    <Badge 
                      bg="light" 
                      text="dark" 
                      style={{ 
                        fontSize: "0.9rem", 
                        padding: "8px 16px", 
                        fontWeight: 600, 
                        borderRadius: "20px" 
                      }}
                    >
                      {orders.length} Total Orders
                    </Badge>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filter */}
      <Row className="mb-4 justify-content-center">
        <Col lg={10}>
          <Card style={{ border: `2px solid ${darkGreen}`, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
            <Card.Body style={{ padding: "20px" }}>
              <Row className="align-items-center">
                <Col md={6}>
                  <Form.Label style={{ fontWeight: 600, color: "#495057", marginBottom: "8px" }}>Filter by Status</Form.Label>
                  <Form.Select 
                    value={filterStatus} 
                    onChange={(e) => setFilterStatus(e.target.value)} 
                    style={{ 
                      maxWidth: "250px",
                      border: `1px solid ${darkGreen}`
                    }}
                  >
                    <option value="All">All Orders</option>
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </Form.Select>
                </Col>
                <Col md={6} className="text-end">
                  <Badge bg="light" text="dark" style={{ fontSize: "0.875rem", padding: "8px 16px", fontWeight: 500 }}>
                    {filteredOrders.length} orders found
                  </Badge>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Table */}
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card style={{ border: `2px solid ${darkGreen}`, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: "8px" }}>
            <Card.Header style={{ backgroundColor: darkGreen, borderBottom: "none", padding: "16px 24px" }}>
              <h5 style={{ margin: 0, color: "white", fontWeight: 600 }}>Orders List</h5>
            </Card.Header>
            <Table hover responsive>
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ borderBottom: `2px solid ${darkGreen}` }}>Order ID</th>
                  <th style={{ borderBottom: `2px solid ${darkGreen}` }}>Buyer</th>
                  <th style={{ borderBottom: `2px solid ${darkGreen}` }}>Seller</th>
                  <th style={{ borderBottom: `2px solid ${darkGreen}` }}>Date</th>
                  <th style={{ borderBottom: `2px solid ${darkGreen}` }}>Status</th>
                  <th style={{ borderBottom: `2px solid ${darkGreen}`, textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map(order => (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: "#2c3e50" }}>#{order.id}</td>
                    <td>{order.buyer}</td>
                    <td>{order.seller}</td>
                    <td>{order.date}</td>
                    <td>
                      <Badge bg={statusColors[order.status]} style={{ fontSize: "0.75rem", padding: "6px 12px", borderRadius: "12px" }}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          onClick={() => handleViewDetails(order)}
                          style={{ border: `1px solid ${darkGreen}` }}
                        >
                          <i className="bi bi-eye"></i> View
                        </Button>
                        <Button 
                          variant="outline-success" 
                          size="sm" 
                          onClick={() => generateInvoice(order)}
                          style={{ border: `1px solid ${darkGreen}` }}
                        >
                          <i className="bi bi-download"></i> Invoice
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>

      {/* Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header 
          closeButton 
          style={{ 
            backgroundColor: "#f8f9fa",
            borderBottom: `2px solid ${darkGreen}`
          }}
        >
          <Modal.Title style={{ fontWeight: 600, color: darkGreen }}>
            Order Details - #{selectedOrder?.id}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <>
              <Row className="mb-4">
                <Col md={6}>
                  <Card style={{ border: `2px solid ${darkGreen}` }}>
                    <Card.Header style={{ backgroundColor: "#f8f9fa", fontWeight: 600, borderBottom: `1px solid ${darkGreen}` }}>
                      Order Information
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Buyer:</strong> {selectedOrder.buyer}</p>
                      <p><strong>Seller:</strong> {selectedOrder.seller}</p>
                      <p><strong>Date:</strong> {selectedOrder.date}</p>
                      <p><strong>Payment:</strong> <Badge bg={selectedOrder.paymentStatus === "Paid" ? "success" : "warning"}>{selectedOrder.paymentStatus}</Badge></p>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card style={{ border: `2px solid ${darkGreen}` }}>
                    <Card.Header style={{ backgroundColor: "#f8f9fa", fontWeight: 600, borderBottom: `1px solid ${darkGreen}` }}>
                      Shipping Information
                    </Card.Header>
                    <Card.Body>
                      <p><strong>Address:</strong><br/>{selectedOrder.shippingAddress}</p>
                      <p><strong>Tracking:</strong> <code>{selectedOrder.trackingID}</code></p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card style={{ border: `2px solid ${darkGreen}` }} className="mb-3">
                <Card.Header style={{ backgroundColor: "#f8f9fa", fontWeight: 600, borderBottom: `1px solid ${darkGreen}` }}>
                  Items Ordered
                </Card.Header>
                <Card.Body>
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                      <div><strong>{item.name}</strong><br/><small>Qty: {item.qty}</small></div>
                      <div style={{ fontWeight: 600, color: "#198754" }}>₹{item.price * item.qty}</div>
                    </div>
                  ))}
                </Card.Body>
              </Card>

              <Card style={{ border: `2px solid ${darkGreen}` }}>
                <Card.Header style={{ backgroundColor: "#f8f9fa", fontWeight: 600, borderBottom: `1px solid ${darkGreen}` }}>
                  Update Status
                </Card.Header>
                <Card.Body>
                  <Row className="align-items-center">
                    <Col md={8}>
                      <Form.Select 
                        value={newStatus} 
                        onChange={(e) => setNewStatus(e.target.value)}
                        style={{ border: `1px solid ${darkGreen}` }}
                      >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </Form.Select>
                    </Col>
                    <Col md={4}>
                      <Button 
                        variant="primary" 
                        onClick={handleUpdateStatus} 
                        className="w-100"
                        style={{ backgroundColor: darkGreen, border: `1px solid ${darkGreen}` }}
                      >
                        Update Status
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: `2px solid ${darkGreen}` }}>
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowModal(false)}
            style={{ border: `1px solid ${darkGreen}` }}
          >
            Close
          </Button>
          <Button 
            variant="success" 
            onClick={() => generateInvoice(selectedOrder)}
            style={{ backgroundColor: darkGreen, border: `1px solid ${darkGreen}` }}
          >
            <i className="bi bi-download"></i> Download Invoice
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;