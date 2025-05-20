import { BrowserRouter as Router,Routes, Route } from "react-router-dom";
import { AuthProvider, Role } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDash";
import UserDashboard from "@/pages/UserDash";
import EmployeeDashboard from "@/pages/EmployeeDash";

export default function App() {
  return (
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={[Role.ADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/user" element={
            <ProtectedRoute allowedRoles={[Role.User]}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={[Role.Employee]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/unauthorized" element={<div className="p-4 text-center">Unauthorized</div>} />
        </Routes>
      </AuthProvider>
  );
}
