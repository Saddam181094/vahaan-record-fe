import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { getSummary } from "@/service/case.service";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/components/LoadingContext";

type ExpiryData = {
  expiryType: string;
  count: number;
};

const AdminDashboard = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const [expiryStats, setExpiryStats] = useState<ExpiryData[]>([]);
  const toast = useToast();
  const {setLoading} = useLoading();
  const handleLogout = () => {
    logout();
  };

  // Simulate API fetch (replace this with actual API call)
  useEffect(() => {
    // replace this with your actual API service
    setLoading(true);
      getSummary()
      .then((resp)=>{
        setExpiryStats(resp?.data?.data)
      })
      .catch((err)=>{
        toast.showToast('Error:',err?.message,'error')
      }).finally(()=>{
        setLoading(false);
      })
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="flex flex-col w-full bg-white px-6 py-4 h-full min-h-screen">
        <div className="flex justify-end mb-4">
          <Button
            style={{ cursor: "pointer" }}
            variant="destructive"
            className="cursor-pointer hover:bg-red-800"
            onClick={() => setOpen(true)}
          >
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
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  style={{ cursor: "pointer" }}
                  variant="outline"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  style={{ cursor: "pointer" }}
                  variant="destructive"
                  className="cursor-pointer hover:bg-red-800"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Expiry Stats Cards Section */}
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-2">
          <span className="col-span-full text-xl font-bold">Summary of the Cases</span>
          {expiryStats.map((item) => (
            <Card key={item.expiryType} className="shadow-md border border-muted">
              <CardHeader className="text-lg font-semibold capitalize">
                {item.expiryType.toLowerCase()}
              </CardHeader>
              <CardContent className="text-3xl font-bold text-primary">
                {item.count}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
