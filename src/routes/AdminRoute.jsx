// src/routes/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isAdmin = localStorage.getItem("gramika_is_admin") === "true";
  return isAdmin ? children : <Navigate to="/" replace />;
}
