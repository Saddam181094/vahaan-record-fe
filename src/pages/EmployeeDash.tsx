import { useEffect, useState } from "react";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/components/LoadingContext";
// import type { ExpiryData } from "./AdminDash";
// import { allCaseColumns, type CaseData } from "@/lib/tables.data";
import { getSummary } from "@/service/case.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
// import { DataTable } from "@/components/DataTable";
import { useNavigate } from "react-router-dom";

const EmployeeDashboard = () => {

    const toast = useToast();
    const { setLoading } = useLoading();
    const [expiryStats, setExpiryStats] = useState<any[]>([]);
    // const [selectedCases, setSelectedCases] = useState<CaseData[]>([]);
    // const [selectedType, setSelectedType] = useState<string | null>(null);
    const navigate = useNavigate();
  
    useEffect(() => {
      setLoading(true);
      getSummary()
        .then((resp) => {
          const data = resp?.data?.data || [];
          setExpiryStats(data);
  
          // Default selection: first card's cases
          // if (data.length > 0) {
          //   setSelectedCases(data[0].cases);
          //   setSelectedType(data[0].expiryType);
          // }
        })
        .catch((err) => {
          toast.showToast("Error:", err?.message || "Summary fetch failed", "error");
        })
        .finally(() => setLoading(false));
    }, []);
  
const handleClick = (data:any) => {
  const type = data;
  navigate(`/employee/vcases`, { state: { type } });
}
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="flex flex-col w-full bg-white pr-6 py-4 h-full min-h-[100vh]">
        <div className="flex justify-end mb-4">
          {/* <Button variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={() => setOpen(true)}>
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
                <Button style={{cursor:"pointer"}} variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </DialogContent>
          </Dialog> */}
        </div>
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

export default EmployeeDashboard;
