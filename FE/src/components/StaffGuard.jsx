// src/components/StaffGuard.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export default function StaffGuard() {
  const user = JSON.parse(localStorage.getItem("ev_user"));
  const roles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
    ? [user.role]
    : [];

  const rolesNorm = roles.map((r) => String(r).toUpperCase());

  if (rolesNorm.includes("STAFF") || rolesNorm.includes("ADMIN")) {
    return <Outlet />; // Cho phép vào
  }

  return <Navigate to="/403" replace />;
}
