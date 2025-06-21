import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/components/LoadingContext";
import type { ExpiryData } from "./AdminDash";
import { allCaseColumns, type CaseData } from "@/lib/tables.data";
import { getSummary } from "@/service/case.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DataTable } from "@/components/DataTable";

const EmployeeDashboard = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };

    const toast = useToast();
    const { setLoading } = useLoading();
    const [expiryStats, setExpiryStats] = useState<ExpiryData[]>([]);
    const [selectedCases, setSelectedCases] = useState<CaseData[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(null);
  
    useEffect(() => {
      setLoading(true);
      getSummary()
        .then((resp) => {
          const data = resp?.data?.data || [];
          setExpiryStats(data);
  
          // Default selection: first card's cases
          if (data.length > 0) {
            setSelectedCases(data[0].cases);
            setSelectedType(data[0].expiryType);
          }
        })
        .catch((err) => {
          toast.showToast("Error:", err?.message || "Summary fetch failed", "error");
        })
        .finally(() => setLoading(false));
    }, []);
  
    const handleCardClick = (expiryType: string, cases: CaseData[]) => {
      setSelectedCases(cases);
      setSelectedType(expiryType);
    };
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="flex flex-col w-full bg-white pr-6 py-4 h-full min-h-[100vh]">
        <div className="flex justify-end mb-4">
          <Button variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={() => setOpen(true)}>
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
          </Dialog>
        </div>
        <div className="flex-grow">
                 <span className="text-4xl font-bold mb-12">Summary of the Cases</span>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Cards - 25% */}
          <div className="w-full lg:w-1/4 space-y-4">
            {expiryStats.map((item, index) => {
              const isSelected = selectedType === item.expiryType;
              const bgColor = index % 2 === 0 ? 'bg-[#584FF7]' : 'bg-[#1f2c4d]';
              const textColor = 'text-white';

              return (
                <Card
                  key={item.expiryType}
                  className={`cursor-pointer border-0 rounded-lg shadow-md ${bgColor} ${textColor} ${
                    isSelected ? 'ring-5 ring-blue-800' : ''
                  }`}
                  onClick={() => handleCardClick(item.expiryType, item.cases)}
                >
                  <CardHeader className="text-lg font-semibold">{item.expiryType}</CardHeader>
                  <CardContent className="text-4xl font-extrabold">{item.count}</CardContent>
                </Card>
              );
            })}
          </div>

          {/* Right: Table - 75% */}
          <div className="w-full lg:w-3/4">
            <DataTable columns={allCaseColumns} data={selectedCases} />
          </div>
        </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default EmployeeDashboard;
