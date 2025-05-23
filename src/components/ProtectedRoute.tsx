// src/components/ProtectedRoute.tsx
// import React from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/context/AuthContext"; // Your auth context hook
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  allowedRoles: string[]; // Roles that can access this route
  children: ReactNode;
}

export function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Not logged in - redirect to login
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    // Logged in but role not authorized
    console.error("Unauthorized access attempt");
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized, show children
  return <>{children}</>;
}
