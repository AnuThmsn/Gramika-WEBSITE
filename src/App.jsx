import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";

// User-side pages
import Home from "./pages/Home.jsx";
import BuyPage from "./pages/BuyPage.jsx";
import ProfilePage from "./pages/Profile.jsx";
import MyShop from "./pages/Myshop.jsx";
import Cart from "./pages/cart.jsx"; // added cart route

// Common Header
import Header from "./components/Header.jsx";

// Route Guard (OPTIONAL: keep or remove; currently allows everyone)
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

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

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

/* ------------------------------------
   PUBLIC LAYOUT (adds the Header)
-------------------------------------- */
function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}
