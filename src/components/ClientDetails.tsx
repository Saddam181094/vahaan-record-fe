import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import type { NewClient } from "@/components/UClient";
import { getCasebyClient} from "@/service/case.service";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "./LoadingContext";

// Dummy types – replace with actual types
type CaseItem = {
  id: string;
  case: {
    id: string;
    CaseNo: string;
    status: string;
    createdAt: string;
    vehicleDetail?: {
      vehicleNo?: string;
    };
  };
  TotalAmount: number;
};

export default function ClientDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const client: NewClient = state?.client;
  const toast = useToast();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const {setLoading} = useLoading();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const { logout } = useAuth();
    const handleLogout = () => {
      logout();
    };

useEffect(() => {
  if (!client?.id) {
    toast.showToast('Error:', 'No Valid Id Provided', 'error');
    return;
  }
  setLoading(true);
  getCasebyClient(client.id)
    .then((res) => setCases(res?.data || []))
    .catch((err) => {
      console.error(err);
      toast.showToast('Error:','No Cases assigned Yet', 'info');
    })
    .finally(()=>setLoading(false));
}, [client?.id]);


  const toggleCard = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
          <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white px-6 py-4 h-full min-h-screen">
          <div className="flex justify-end mb-4">
            <Button style={{cursor:"pointer"}} variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={() => setOpen(true)}>
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
                  <Button style={{cursor:"pointer"}} variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button style={{cursor:"pointer"}} variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
    <div className="flex-grow p-6 space-y-6">
      {/* Top Client Info Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold">
            {client.firstName} {client.lastName}
          </h2>
          <p className="text-sm text-muted-foreground">
            {client.email} | {client.mobileNo}
          </p>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <RenderField label="Firm" value={client.firmName} />
          <RenderField label="Address" value={`${client.address1}, ${client.city}`} />
          <RenderField label="Pincode" value={client.pincode} />
          <RenderField label="Credit Limit" value={`₹${client?.creditLimit ?? "N/A"}`} />
        </CardContent>
      </Card>

      {/* Case Cards */}

      {cases.length === 0 ? (
  <p className="text-muted-foreground text-center">No cases found for this client.</p>
) : (
      cases.map((item, idx) => {
        const isOpen = expandedIndex === idx;
        const { id, case: caseData, TotalAmount } = item;

        return (
          <Card key={id} className="border shadow-md">
            <CardHeader
              className="flex justify-between items-center cursor-pointer"
              onClick={() => toggleCard(idx)}
            >
              <div>
                <h2 className="font-semibold text-lg">Case #{caseData.CaseNo}</h2>
                <p className="text-sm text-muted-foreground">{caseData.status}</p>
              </div>
              {isOpen ? <ChevronUp /> : <ChevronDown />}
            </CardHeader>

            {isOpen && (
              <CardContent className="space-y-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <RenderField
                    label="Vehicle No"
                    value={caseData.vehicleDetail?.vehicleNo ?? "N/A"}
                  />
                  <RenderField
                    label="Created On"
                    value={new Date(caseData.createdAt).toLocaleDateString()}
                  />
                  <RenderField
                    label="Total Amount"
                    value={`₹${(+TotalAmount).toFixed(2)}/-`}
                  />
                  <RenderField label="Status" value={caseData.status} />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() =>
                      navigate(`/superadmin/cases/${caseData.CaseNo}`, {
                        state: { id: caseData.id },
                      })
                    }
                    variant="outline"
                    size="sm"
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })
)}
    </div>
</div>
      </SidebarProvider>
  );
}

// Reusable field renderer
function RenderField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
