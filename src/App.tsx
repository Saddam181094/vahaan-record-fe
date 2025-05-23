import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserRole } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import LoginPage from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDash";
import UserDashboard from "@/pages/UserDash";
import EmployeeDashboard from "@/pages/EmployeeDash";
import AddBranch from "@/pages/AdBranch";
import AddFirm from "@/pages/AdFirm";
import AddEmployee from "@/pages/AdEmp";
export default function App() {
  return (

    <Routes>

      {/* General Routes */}
      <Route path="/" element={<LoginPage />} />
      <Route path="/unauthorized" element={<div className="p-4 text-center">Unauthorized</div>} />

      {/* Super Admin Routes */}

      <Route path="/superadmin" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      <Route path="/superadmin/AddBranch" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <AddBranch />
        </ProtectedRoute>
      } />

      <Route path="/superadmin/AddFirm" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <AddFirm />
        </ProtectedRoute>
      } />

      <Route path="/superadmin/AddEmployee" element={
        <ProtectedRoute allowedRoles={[UserRole.SUPERADMIN]}>
          <AddEmployee />
        </ProtectedRoute>
      } />



      {/* Super Admin Routes */}

      <Route path="/client" element={
        <ProtectedRoute allowedRoles={[UserRole.CLIENT]}>
          <UserDashboard />
        </ProtectedRoute>
      } />


      {/* Super Admin Routes */}
      <Route path="/employee" element={
        <ProtectedRoute allowedRoles={[UserRole.EMPLOYEE]}>
          <EmployeeDashboard />
        </ProtectedRoute>
      } />





    </Routes>
  );
}
