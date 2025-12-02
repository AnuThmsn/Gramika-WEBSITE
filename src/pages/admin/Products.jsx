import React, { useState, useEffect } from "react";
import { useSearchParams } from 'react-router-dom';
import { Card, Row, Col, Table, Button, Badge, Form, InputGroup, Modal } from "react-bootstrap";
// Importing icons from react-icons
import { BsSearch, BsTags, BsCheckLg, BsXLg, BsPencil, BsTrash } from "react-icons/bs";

const Products = () => {
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get('q') ?? '';
  const [searchTerm, setSearchTerm] = useState(initialQ);
  useEffect(() => {
    // update local search when URL changes
    setSearchTerm(initialQ);
  }, [initialQ]);

  // Theme Colors
  const lightGreen = "#e8f5e8";
  const darkGreen = "#1a622bff";

  // State: Categories
  const [categories, setCategories] = useState([
    "Vegetables",
    "Fruits",
    "Spices",
    "Handicrafts",
    "Dairy",
  ]);
  
  // State: Category Modal
  const [showCatModal, setShowCatModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  // State: Products Data
  const [products, setProducts] = useState([
    {
      id: "P001",
      name: "Organic Carrots (1kg)",
      category: "Vegetables",
      seller: "Meera Stores",
      price: 60,
      stock: 45,
      status: "Active", // Live on site
      image: "🥕",
    },
    {
      id: "P002",
      name: "Homemade Mango Pickle",
      category: "Spices",
      seller: "Grandma's Kitchen",
      price: 150,
      stock: 12,
      status: "Pending", // Needs approval
      image: "🏺",
    },
    {
      id: "P003",
      name: "Bamboo Basket",
      category: "Handicrafts",
      seller: "Crafty Hands",
      price: 350,
      stock: 5,
      status: "Active",
      image: "🧺",
    },
    {
      id: "P004",
      name: "Fresh Cow Milk (1L)",
      category: "Dairy",
      seller: "Organic Farms",
      price: 55,
      stock: 20,
      status: "Rejected", // Failed compliance
      image: "🥛",
    },
    {
      id: "P005",
      name: "Red Spinach Bunch",
      category: "Vegetables",
      seller: "Fresh Veggies",
      price: 30,
      stock: 100,
      status: "Pending",
      image: "🌿",
    },
  ]);

  // State: Filters
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");

  // Actions
  const handleApprove = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, status: "Active" } : p));
  };

  const handleReject = (id) => {
    setProducts(products.map(p => p.id === id ? { ...p, status: "Rejected" } : p));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this listing permanently?")) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  // Category Management
  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const handleDeleteCategory = (cat) => {
    setCategories(categories.filter(c => c !== cat));
  };

  // Filter Logic
  const filteredProducts = products.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || item.status === filterStatus;
    const matchesCategory = filterCategory === "All" || item.category === filterCategory;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div style={{ padding: "24px", backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Product Management</h2>
        <Button variant="outline-primary" onClick={() => setShowCatModal(true)}>
          <BsTags className="me-2" /> {/* React Icon for Tags */}
          Manage Categories
        </Button>
      </div>

      {/* Stats Overview */}
      <Row className="g-3 mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0" style={{ borderLeft: `4px solid ${darkGreen}` }}>
            <Card.Body>
              <h6 className="text-muted">Total Products</h6>
              <h3>{products.length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0" style={{ borderLeft: "4px solid #fd7e14" }}>
            <Card.Body>
              <h6 className="text-muted">Pending Approval</h6>
              <h3>{products.filter(p => p.status === "Pending").length}</h3>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="shadow-sm border-0" style={{ borderLeft: "4px solid #198754" }}>
            <Card.Body>
              <h6 className="text-muted">Live Items</h6>
              <h3>{products.filter(p => p.status === "Active").length}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters Bar */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-white">
                    <BsSearch /> {/* React Icon for Search */}
                </InputGroup.Text>
                <Form.Control 
                  placeholder="Search products or sellers..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                <option value="All">All Categories</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending Approval</option>
                <option value="Rejected">Rejected</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Products Table */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-0">
          <Table hover responsive className="mb-0">
            <thead style={{ backgroundColor: lightGreen }}>
              <tr>
                <th style={{ padding: "16px" }}>Item</th>
                <th style={{ padding: "16px" }}>Category</th>
                <th style={{ padding: "16px" }}>Seller</th>
                <th style={{ padding: "16px" }}>Price / Stock</th>
                <th style={{ padding: "16px" }}>Status</th>
                <th style={{ padding: "16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((item) => (
                <tr key={item.id} style={{ verticalAlign: "middle" }}>
                  <td style={{ padding: "16px" }}>
                    <div className="d-flex align-items-center">
                      <div style={{ 
                        width: "40px", height: "40px", 
                        backgroundColor: "#f1f3f4", borderRadius: "8px", 
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.2rem", marginRight: "12px"
                      }}>
                        {item.image}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{item.name}</div>
                        <small className="text-muted">{item.id}</small>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Badge bg="light" text="dark" className="border">
                      {item.category}
                    </Badge>
                  </td>
                  <td style={{ padding: "16px" }}>{item.seller}</td>
                  <td style={{ padding: "16px" }}>
                    <div style={{ fontWeight: 600 }}>₹{item.price}</div>
                    <small className="text-muted">{item.stock} in stock</small>
                  </td>
                  <td style={{ padding: "16px" }}>
                    <Badge 
                      bg={
                        item.status === "Active" ? "success" : 
                        item.status === "Pending" ? "warning" : "danger"
                      }
                      style={{ fontWeight: 500 }}
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td style={{ padding: "16px", textAlign: "right" }}>
                    {item.status === "Pending" ? (
                      // Approval Queue Actions with React Icons
                      <div className="d-flex justify-content-end gap-2">
                         <Button 
                          variant="success" 
                          size="sm" 
                          onClick={() => handleApprove(item.id)}
                          title="Approve"
                        >
                          <BsCheckLg />
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleReject(item.id)}
                          title="Reject"
                        >
                          <BsXLg />
                        </Button>
                      </div>
                    ) : (
                      // Live Item Actions with React Icons
                      <div className="d-flex justify-content-end gap-2">
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          title="Edit"
                        >
                          <BsPencil />
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          title="Delete Listing"
                        >
                          <BsTrash />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">
                    No products found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Category Management Modal */}
      <Modal show={showCatModal} onHide={() => setShowCatModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Manage Categories</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="New category name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <Button variant="success" onClick={handleAddCategory}>Add</Button>
          </InputGroup>

          <div className="d-flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge 
                key={cat} 
                bg="light" 
                text="dark" 
                className="border p-2 d-flex align-items-center gap-2"
                style={{ fontSize: "0.9rem" }}
              >
                {cat}
                <span 
                  style={{ cursor: "pointer", color: "#dc3545" }} 
                  onClick={() => handleDeleteCategory(cat)}
                >
                  &times;
                </span>
              </Badge>
            ))}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCatModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
};

export default Products;