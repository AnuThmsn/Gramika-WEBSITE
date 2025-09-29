import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Shop from './pages/BuyPage.jsx'
import Home from './pages/Home.jsx';
// Removed old SellerDashboard and Orders imports
import MyShop from './pages/Myshop.jsx'; // New unified dashboard component

import './App.css';

function App() {
    return (
        <Router>
            <div className="App">
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/about" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        {/* New unified Seller Dashboard route */}
                        <Route path="/myshop/*" element={<MyShop />} />
                        {/* Removed old /seller and /orders routes */}
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;