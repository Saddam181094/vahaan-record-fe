import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";  
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import UClient from "@/components/UClient";

const AddBranch = () => {
    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
    };  
    return(<>
    <SidebarProvider>
       <AppSidebar />
        <SidebarTrigger />
         <div className="flex flex-col w-full bg-white px-6 py-4 h-full min-h-screen">
          <div className="flex justify-end mb-4">
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </div>
          <div className="flex-grow">
            <UClient />
          </div>
        </div>
          </SidebarProvider>

          </>
    );
};

export default AddBranch;