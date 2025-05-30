import CaseDesEmployee from "@/components/CaseDesEmployee"
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";  
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

const Allcases = () => {
 const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white px-6 py-4 h-full min-h-screen">
          <div className="flex justify-end mb-4">
            <Button variant="destructive" onClick={() => setOpen(true)}>
            Logout
          </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to logout?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                   <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  Logout
                </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="flex-grow">
            <CaseDesEmployee/>
          </div>
        </div>
      </SidebarProvider>
    </>
    );
};

export default Allcases;