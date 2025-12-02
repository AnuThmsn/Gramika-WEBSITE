import React, { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { Card, Row, Col, Table, Badge, Button, Modal, Form } from "react-bootstrap";
import { jsPDF } from "jspdf";

const Orders = () => {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get('q') ?? '').trim().toLowerCase();
  const [orders, setOrders] = useState([
    {
      id: 101, buyer: "Alice", seller: "Farmer John", items: [{ name: "Rice", qty: 2, price: 100 }],
      date: "2025-11-30", status: "Pending", shippingAddress: "123 Main St", paymentStatus: "Paid", trackingID: "TRK12345",
    },
    {
      id: 102, buyer: "Bob", seller: "Local Veggies", items: [{ name: "Tomatoes", qty: 1, price: 50 }],
      date: "2025-11-29", status: "Delivered", shippingAddress: "456 Park Ave", paymentStatus: "Paid", trackingID: "TRK12346",
    },
    {
      id: 103, buyer: "Charlie", seller: "Green Earth", items: [{ name: "Carrots", qty: 5, price: 40 }],
      date: "2025-11-28", status: "Shipped", shippingAddress: "789 Pine Ln", paymentStatus: "Paid", trackingID: "TRK12347",
    },
  ]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [newStatus, setNewStatus] = useState("");
  const [filteredOrders, setFilteredOrders] = useState(orders);

  const statusColors = {
    Pending: "warning", Processing: "primary", Shipped: "info", 
    Delivered: "success", Cancelled: "danger"
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "Pending").length;
  const deliveredOrders = orders.filter(o => o.status === "Delivered").length;
  const totalRevenue = orders.reduce((acc, order) => acc + order.items.reduce((sum, item) => sum + (item.price * item.qty), 0), 0);

  useEffect(() => {
    // apply ?q= filter by id / buyer / seller / item name
    if (!q) {
      setFilteredOrders(filterStatus === "All" ? orders : orders.filter(o => o.status === filterStatus));
      return;
    }
    const res = orders.filter(o => {
      return String(o.id).toLowerCase().includes(q)
         || o.buyer.toLowerCase().includes(q)
         || o.seller.toLowerCase().includes(q)
         || o.items.some(i => i.name.toLowerCase().includes(q));
    }).filter(o => filterStatus === "All" ? true : o.status === filterStatus);
    setFilteredOrders(res);
  }, [q, orders, filterStatus]);

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
    doc.text(`Invoice #${order.id}`, 14, 22);
    doc.text(`Total: ${order.items.reduce((s, i) => s + i.price * i.qty, 0)}`, 14, 32);
    doc.save(`Invoice_${order.id}.pdf`);
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Orders Management</h2>

      {/* TOP STAT CARDS */}
      <Row className="mb-4">
        {[
          { title: "Total Orders", value: totalOrders },
          { title: "Pending", value: pendingOrders },
          { title: "Delivered", value: deliveredOrders },
          { title: "Revenue", value: `₹${totalRevenue}` },
        ].map((card, i) => (
          <Col md={3} key={i}>
            <Card className="text-center shadow-sm">
              <Card.Body>
                <Card.Title className="text-muted" style={{ fontSize: '0.9rem' }}>{card.title}</Card.Title>
                <h4 className="mb-0">{card.value}</h4>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ORDERS TABLE SECTION */}
      <Card className="shadow-sm p-3 mb-4">
        <Row className="align-items-center mb-3">
          <Col md={6}>
            <h5 className="mb-0">All Orders</h5>
          </Col>
          <Col md={6} className="d-flex justify-content-end gap-2 align-items-center">
            <span className="text-muted">Filter by:</span>
            <Form.Select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)} 
              style={{ maxWidth: "200px" }}
              size="sm"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
            </Form.Select>
          </Col>
        </Row>

        <Table striped bordered hover responsive className="align-middle">
          <thead className="table-light">
            <tr>
              <th>Order ID</th>
              <th>Buyer</th>
              <th>Seller</th>
              <th>Date</th>
              <th>Status</th>
              {/* Added width here to prevent squeezing */}
              <th className="text-center" style={{ minWidth: "180px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td className="fw-bold">#{order.id}</td>
                <td>{order.buyer}</td>
                <td>{order.seller}</td>
                <td>{order.date}</td>
                <td>
                  <Badge bg={statusColors[order.status]} className="px-3 py-2 rounded-pill">
                    {order.status}
                  </Badge>
                </td>
                <td className="text-center">
                  {/* Flex container fixes the layout */}
                  <div className="d-flex justify-content-center gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      onClick={() => handleViewDetails(order)}
                      style={{ minWidth: "70px" }}
                    >
                      View
                    </Button>
                    <Button 
                      variant="outline-success" 
                      size="sm" 
                      onClick={() => generateInvoice(order)}
                      style={{ minWidth: "70px" }}
                    >
                      Invoice
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Order Details #{selectedOrder?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <Form>
               <Row className="mb-3">
                 <Col md={6}><p><strong>Buyer:</strong> {selectedOrder.buyer}</p></Col>
                 <Col md={6}><p><strong>Status:</strong> {selectedOrder.status}</p></Col>
               </Row>
               <Form.Group>
                 <Form.Label>Update Status</Form.Label>
                 <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                   <option>Pending</option>
                   <option>Shipped</option>
                   <option>Delivered</option>
                 </Form.Select>
               </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleUpdateStatus}>Update</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;