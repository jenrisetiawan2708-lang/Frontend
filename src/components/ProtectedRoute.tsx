/**
 * ProtectedRoute - Proteksi route berdasarkan role
 * Redirect ke /login jika belum login
 * Redirect ke halaman yang sesuai jika role tidak cocok
 */

import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../api/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "penghuni" | "owner";
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    // Redirect ke dashboard yang sesuai kalau role salah
    if (user.role === "owner") return <Navigate to="/homeadmin" replace />;
    if (user.role === "penghuni") return <Navigate to="/dashboard-penghuni" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
