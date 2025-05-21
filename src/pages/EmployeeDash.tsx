import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
const EmployeeDashboard = () => {
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex bg-gray-100 items-center justify-between px-6 py-4">
          <div className="text-xl">Welcome, Employee</div>
          <Button variant="destructive" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div></div>
      </SidebarProvider>
    </>
  );
};

export default EmployeeDashboard;
