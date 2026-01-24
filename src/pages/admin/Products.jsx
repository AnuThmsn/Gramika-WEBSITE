import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Badge,
  Form,
  InputGroup,
  Modal
} from "react-bootstrap";
import {
  BsSearch,
  BsTags,
  BsCheckLg,
  BsXLg,
  BsTrash,
  BsExclamationTriangle,
  BsEye
} from "react-icons/bs";

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [searchTerm, setSearchTerm] = useState(initialQ);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [productToReject, setProductToReject] = useState(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [productToReport, setProductToReport] = useState(null);

  const [showCatModal, setShowCatModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  const categories = ["Vegetables", "Fruits", "Spices", "Handicrafts", "Dairy"];

  const apiHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("gramika_token")}`,
    "Content-Type": "application/json"
  });

  // 🔒 Normalize legacy DB values
  const normalizeStatus = (status) => {
    if (status === "Pending") return "Reported";
    return status || "Active";
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/products", {
          headers: { Authorization: `Bearer ${localStorage.getItem("gramika_token")}` }
        });

        const data = await res.json();
        const mapped = data.map((p) => ({
          id: p._id,
          name: p.name,
          category: p.category || "—",
          seller: p.seller?.name || "Unknown",
          price: p.price,
          stock: p.quantity ?? 0,
          status: normalizeStatus(p.status),
          image: p.imageUrl || "",
          rejectReason: p.rejectReason || ""
        }));

        setProducts(mapped);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleApprove = async (id) => {
    await fetch(`/api/products/${id}`, {
      method: "PUT",
      headers: apiHeaders(),
      body: JSON.stringify({ status: "Active", rejectReason: "" })
    });

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: "Active", rejectReason: "" } : p))
    );
  };

  const confirmReject = async () => {
    await fetch(`/api/products/${productToReject}/reject`, {
      method: "PUT",
      headers: apiHeaders()
    });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productToReject
          ? { ...p, status: "Rejected", rejectReason: rejectReason || "Rejected by admin" }
          : p
      )
    );

    setShowRejectModal(false);
    setRejectReason("");
  };

  const confirmReport = async () => {
    await fetch(`/api/products/${productToReport}`, {
      method: "PUT",
      headers: apiHeaders(),
      body: JSON.stringify({
        status: "Reported",
        rejectReason: reportReason || "Reported by admin"
      })
    });

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productToReport
          ? { ...p, status: "Reported", rejectReason: reportReason }
          : p
      )
    );

    setShowReportModal(false);
    setReportReason("");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, {
      method: "DELETE",
      headers: apiHeaders()
    });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "success";
      case "Reported":
        return "warning";
      case "Rejected":
        return "danger";
      default:
        return "secondary";
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.seller.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === "All" || p.status === filterStatus;
    const matchCategory = filterCategory === "All" || p.category === filterCategory;

    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div style={{ padding: 24, background: "#f8f9fa", minHeight: "100vh" }}>
      <h2 className="mb-4">Product Management</h2>

      {/* Stats */}
      <Row className="mb-4">
        <Col md={4}><Card><Card.Body><h6>Total</h6><h3>{products.length}</h3></Card.Body></Card></Col>
        <Col md={4}><Card><Card.Body><h6>Active</h6><h3>{products.filter(p => p.status === "Active").length}</h3></Card.Body></Card></Col>
        <Col md={4}><Card><Card.Body><h6>Reported</h6><h3>{products.filter(p => p.status === "Reported").length}</h3></Card.Body></Card></Col>
      </Row>

      {/* Filters */}
      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text><BsSearch /></InputGroup.Text>
                <Form.Control value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Reported">Reported</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Table */}
      <Card>
        <Table hover responsive>
          <thead>
  <tr>
    <th>Item</th>
    <th>Category</th>   {/* NEW */}
    <th>Seller</th>
    <th>Price / Stock</th>
    <th>Status</th>
    <th className="text-end">Actions</th>
  </tr>
</thead>

          <tbody>
            {filteredProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>
  <Badge bg="light" text="dark" className="border">
    {p.category}
  </Badge>
</td>
                <td>{p.seller}</td>
                

                <td>₹{p.price} · {p.stock}</td>
                <td><Badge bg={getStatusColor(p.status)}>{p.status}</Badge></td>
                <td className="text-end">
  <div className="d-flex justify-content-end gap-2">

    {p.status === "Active" && (
      <>
        <Button
          size="sm"
          variant="warning"
          title="Mark as reported"
          onClick={() => {
            setProductToReport(p.id);
            setShowReportModal(true);
          }}
        >
          <BsExclamationTriangle />
        </Button>

        <Button
          size="sm"
          variant="danger"
          title="Reject product"
          onClick={() => {
            setProductToReject(p.id);
            setShowRejectModal(true);
          }}
        >
          <BsXLg />
        </Button>
      </>
    )}

    {p.status !== "Active" && (
      <Button
        size="sm"
        variant="success"
        title="Activate product"
        onClick={() => handleApprove(p.id)}
      >
        <BsCheckLg />
      </Button>
    )}

    <Button
      size="sm"
      variant="outline-danger"
      title="Delete product"
      onClick={() => handleDelete(p.id)}
    >
      <BsTrash />
    </Button>

    <Button
      size="sm"
      variant="outline-secondary"
      title="View details"
    >
      <BsEye />
    </Button>

  </div>
</td>

              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Reject Modal */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)}>
        <Modal.Header closeButton><Modal.Title>Reject Product</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Control as="textarea" rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>Cancel</Button>
          <Button variant="danger" onClick={confirmReject}>Reject</Button>
        </Modal.Footer>
      </Modal>

      {/* Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
        <Modal.Header closeButton><Modal.Title>Report Product</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form.Control as="textarea" rows={3} value={reportReason} onChange={e => setReportReason(e.target.value)} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>Cancel</Button>
          <Button variant="warning" onClick={confirmReport}>Report</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Products;
