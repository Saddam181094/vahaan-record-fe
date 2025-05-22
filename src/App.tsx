import { BrowserRouter as Router,Routes, Route } from "react-router-dom";
import { UserRole } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDash";
import UserDashboard from "@/pages/UserDash";
import EmployeeDashboard from "@/pages/EmployeeDash";
import AddBranch from "@/pages/AdBranch";
import AddFirm from "@/pages/AdFirm";
export default function App() {
  return (

        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/superadmin" element={
            <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/client" element={
            <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path="/employee" element={
            <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          } />
          <Route path="/unauthorized" element={<div className="p-4 text-center">Unauthorized</div>} />
          <Route path="/superadmin/AddBranch" element={<AddBranch />} />
          <Route path="/superadmin/AddFirm" element={<AddFirm/>} />
        </Routes>
  );
}
