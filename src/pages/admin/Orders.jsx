import React, { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { Card, Row, Col, Table, Badge, Button, Modal, Form } from "react-bootstrap";
import { jsPDF } from "jspdf";

const Orders = () => {
  const [searchParams] = useSearchParams();
  const q = (searchParams.get('q') ?? '').trim().toLowerCase();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [newStatus, setNewStatus] = useState("");
  const [filteredOrders, setFilteredOrders] = useState(orders);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);

  const statusColors = {
    pending: "warning", 
    processing: "primary", 
    delivered: "success", 
    cancelled: "danger"
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(o => o.status === "pending").length;
  const deliveredOrders = orders.filter(o => o.status === "delivered").length;
  const totalRevenue = orders.reduce((acc, order) => acc + (order.total || 0), 0);

  // Fetch all orders from the database
  useEffect(() => {
    let mounted = true;
    const fetchOrders = async () => {
      const token = localStorage.getItem('gramika_token');
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch('/api/orders/admin', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch orders:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOrders();
    
    // Listen for order updates
    const onUpdated = () => fetchOrders();
    window.addEventListener('orderUpdated', onUpdated);
    return () => { mounted = false; window.removeEventListener('orderUpdated', onUpdated); };
  }, []);

  // Filter and search orders
  useEffect(() => {
    if (!q) {
      setFilteredOrders(filterStatus === "All" ? orders : orders.filter(o => o.status === filterStatus));
      return;
    }
    const res = orders.filter(o => {
      const orderIdMatch = String(o._id || '').toLowerCase().includes(q);
      const buyerMatch = (o.user?.name || '').toLowerCase().includes(q);
      const itemMatch = (o.items || []).some(i => (i.name || '').toLowerCase().includes(q));
      return orderIdMatch || buyerMatch || itemMatch;
    }).filter(o => filterStatus === "All" ? true : o.status === filterStatus);
    setFilteredOrders(res);
  }, [q, orders, filterStatus]);

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowModal(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || !newStatus) return;
    
    const token = localStorage.getItem('gramika_token');
    if (!token) {
      alert('Not authorized');
      return;
    }

    setUpdatingOrderId(selectedOrder._id);
    try {
      const res = await fetch(`/api/orders/${selectedOrder._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(`Failed to update order: ${err.msg || 'Unknown error'}`);
        return;
      }

      const updatedOrder = await res.json();
      
      // Update local state
      setOrders(prev =>
        prev.map(o => (o._id === selectedOrder._id ? updatedOrder : o))
      );
      
      alert(`✅ Order status updated to ${newStatus}`);
      setShowModal(false);
      window.dispatchEvent(new Event('orderUpdated'));
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Could not update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const generateInvoice = (order) => {
    const doc = new jsPDF();
    doc.text(`Invoice #${(order._id || '').slice(-6).toUpperCase()}`, 14, 22);
    const itemsText = (order.items || []).map(i => `${i.name} x${i.quantity} @ ₹${i.price}`).join(', ');
    doc.text(`Items: ${itemsText}`, 14, 32);
    doc.text(`Total: ₹${order.total || 0}`, 14, 42);
    doc.save(`Invoice_${order._id}.pdf`);
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
          { title: "Revenue", value: `₹${totalRevenue.toFixed(2)}` },
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
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </Form.Select>
          </Col>
        </Row>

        {loading ? (
          <p className="text-center">Loading orders...</p>
        ) : (
          <Table striped bordered hover responsive className="align-middle">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Buyer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th className="text-center" style={{ minWidth: "180px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center">No orders found</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order._id}>
                    <td className="fw-bold">#{(order._id || '').slice(-6).toUpperCase()}</td>
                    <td>{order.user?.name || order.user?.email || 'Unknown'}</td>
                    <td>{(order.items || []).map(i => `${i.name || 'N/A'} x${i.quantity}`).join(', ')}</td>
                    <td>₹{order.total || 0}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <Badge bg={statusColors[order.status] || 'secondary'} className="px-3 py-2 rounded-pill" style={{ textTransform: 'capitalize' }}>
                        {order.status || 'pending'}
                      </Badge>
                    </td>
                    <td className="text-center">
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
                ))
              )}
            </tbody>
          </Table>
        )}
      </Card>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Order Details #{selectedOrder?._id && (selectedOrder._id).slice(-6).toUpperCase()}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrder && (
            <Form>
              <Row className="mb-3">
                <Col md={6}><p><strong>Buyer:</strong> {selectedOrder.user?.name || selectedOrder.user?.email || 'Unknown'}</p></Col>
                <Col md={6}><p><strong>Current Status:</strong> <span style={{ textTransform: 'capitalize' }}>{selectedOrder.status || 'pending'}</span></p></Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}><p><strong>Items:</strong> {(selectedOrder.items || []).map(i => `${i.name} x${i.quantity}`).join(', ')}</p></Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}><p><strong>Total Amount:</strong> ₹{selectedOrder.total || 0}</p></Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}><p><strong>Address:</strong> {selectedOrder.address || 'N/A'}</p></Col>
              </Row>
              <Form.Group>
                <Form.Label>Update Status</Form.Label>
                <Form.Select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  disabled={updatingOrderId === selectedOrder._id}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={updatingOrderId === selectedOrder?._id}>Close</Button>
          <Button 
            variant="primary" 
            onClick={handleUpdateStatus}
            disabled={updatingOrderId === selectedOrder?._id}
          >
            {updatingOrderId === selectedOrder?._id ? 'Updating...' : 'Update Status'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Orders;