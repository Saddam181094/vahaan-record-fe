import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getSummary } from "@/service/case.service";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/components/LoadingContext";
import { useNavigate } from "react-router-dom";

type ExpiryData = {
  expiryType: string;
  count: number;
};

const AdminDashboard = () => {
  const [expiryStats, setExpiryStats] = useState<ExpiryData[]>([]);
  const toast = useToast();
  const {setLoading} = useLoading();
  const navigate = useNavigate();

const handleClick = (data:any) => {
  const type = data;
  navigate(`/superadmin/cases/all`, { state: { type } });
}

  // Simulate API fetch (replace this with actual API call)
  useEffect(() => {
    // replace this with your actual API service
    setLoading(true);
      getSummary()
      .then((resp)=>{
        setExpiryStats(resp?.data?.data)
      })
      .catch((err)=>{
        toast.showToast('Error:',err?.message || 'Summary was not fetched due to some error','error')
      }).finally(()=>{
        setLoading(false);
      })
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh] ms-3">
        <div className="flex justify-end mb-4">
          {/* <Button
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
          </Dialog> */}
        </div>

        {/* Expiry Stats Cards Section */}
<div className="flex flex-col w-full h-full min-h-screen overflow-y-auto">
  <span className="col-span-full text-4xl font-bold mb-10 block">Summary of the Cases</span>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-2">
    {expiryStats.map((item, index) => {
      const isEven = index % 2 === 0;
      const bgColor = isEven ? 'bg-[#584FF7]' : 'bg-[#1f2c4d]'; // Metallic tones
      const textColor = 'text-white';

      return (
        <Card
          key={item.expiryType}
          className={`shadow-md border-0 ${bgColor} ${textColor} rounded-lg flex flex-col j`}
          onClick={()=> handleClick(item.expiryType)}
          style={{ cursor: "pointer" }}
        >
          <CardHeader className="text-lg font-semibold">
            {item.expiryType}
          </CardHeader>
          <CardContent className="text-4xl font-extrabold">
            {item.count}
          </CardContent>
        </Card>
      );
    })}
  </div>
</div>

      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
