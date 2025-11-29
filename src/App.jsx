import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout.jsx";

// User-side pages
import Home from "./pages/Home.jsx";
import BuyPage from "./pages/BuyPage.jsx";
import ProfilePage from "./pages/Profile.jsx";
import MyShop from "./pages/Myshop.jsx";
import Cart from "./pages/cart.jsx"; // added cart route

// Admin-side pages
import Dashboard from "./pages/admin/Dashboard.jsx";
import Products from "./pages/admin/Products.jsx";
import Orders from "./pages/admin/Orders.jsx";
import Users from "./pages/admin/Users.jsx";
import Payouts from "./pages/admin/Payouts.jsx";
import Settings from "./pages/admin/Settings.jsx";

// Common Header
import Header from "./components/Header.jsx";

// Route Guard (OPTIONAL: keep or remove; currently allows everyone)
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";

import "./App.css";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* All user-facing routes share UserLayout (Header visible) */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<BuyPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          {/* My Shop route (no auth for now — change easily later) */}
          <Route path="/my-shop" element={<MyShop />} />
          <Route path="/cart" element={<Cart />} />
        </Route>

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="payouts" element={<Payouts />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}


