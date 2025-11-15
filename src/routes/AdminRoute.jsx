// src/routes/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem("gramika_admin");  

  if (!isAdmin) {
    return <Navigate to="/adminlogin" replace />;
  }

  return children;
}
