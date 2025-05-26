import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import CaseForm  from "@/components/CaseForm";

const AddBranch = () => { 
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <SidebarProvider>
        <div className="flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-h-screen bg-white">
            <div className="flex items-center justify-between px-6 sticky top-0 bg-white z-10 border-b">
              <SidebarTrigger />
              <Button variant="destructive" onClick={handleLogout}>
                Logout
              </Button>
            </div>
            <div className="flex-grow">
              <CaseForm />
            </div>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default AddBranch;
