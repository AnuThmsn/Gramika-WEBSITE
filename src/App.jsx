import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// User-side pages
import Home from "./pages/Home.jsx";
import Shop from "./pages/BuyPage.jsx";
import ProfilePage from "./pages/Profile.jsx";
import MyShop from "./pages/MyShop.jsx";

// Common Header
import Header from "./components/Header.jsx";

// Route Guard (OPTIONAL: keep or remove; currently allows everyone)
import ProtectedRoute from "./routes/ProtectedRoute.jsx";

import "./App.css";

export default function App() {
  return (
    <Router>
      <Routes>

        {/* ===============================
            PUBLIC ROUTES (Header on top)
        =============================== */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/about"
          element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          }
        />

        <Route
          path="/shop"
          element={
            <PublicLayout>
              <Shop />
            </PublicLayout>
          }
        />

        {/* ===============================
            USER PROTECTED ROUTES
            (You can disable ProtectedRoute
             if you don't need user login)
        =============================== */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <ProfilePage />
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/myshop/*"
          element={
            <ProtectedRoute>
              <PublicLayout>
                <MyShop />
              </PublicLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallback redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
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
