// src/routes/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const isAdmin = Boolean(localStorage.getItem("gramika_admin"));
  const allowInDev = process.env.NODE_ENV === 'development';
  return (isAdmin || allowInDev) ? children : <Navigate to="/" replace />;
}
