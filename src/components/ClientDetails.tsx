import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import type { NewClient } from "@/components/UClient";
import { getCasebyClient } from "@/service/case.service";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "./LoadingContext";
import { useAuth } from "@/context/AuthContext";

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
  const { setLoading } = useLoading();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  // const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  // const handleLogout = () => {
  //   logout();
  // };

  useEffect(() => {
    if (!client.users[0]?.id) {
      toast.showToast('Error:', 'No Valid Id Provided', 'error');
      return;
    }
    setLoading(true);
    getCasebyClient(client.users[0]?.id)
      .then((res) => setCases(res?.data?.cases || []))
      .catch((err) => {
        if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        toast.showToast('Warning:', err?.message || 'No Cases assigned Yet', 'warning');
      })
      .finally(() => setLoading(false));
  }, [client?.id]);


  const toggleCard = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh]">
        <div className="flex justify-end mb-4">
          <Button
            style={{ cursor: "pointer" }}
            variant="default"
            className="sticky cursor-pointer z-50 mr-5 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
            onClick={() => navigate(-1)}
          >
            ← Back
          </Button>
        </div>
      <Card className=" mb-6">
        <CardHeader>
          <div className="flex gap-4 flex-1 md:items-center">
            <div className="h-16 w-24 md:h-24 md:w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 md:text-4xl text-2xl font-bold">
              {client?.firstName?.[0] ?? ''}{client?.lastName?.[0] ?? ''}
            </div>
            <div className="space-y-1">
              <p><strong>Name:</strong> {client?.firstName} {client?.lastName}</p>
              <p><strong>Email:</strong> {client?.email}</p>
              <p className="text-sm text-muted-foreground">
                {client.firmName} {client.address1}, {client.address2}, {client.city} {client.state} {client.pincode}
              </p>
            </div>
          </div>

        </CardHeader>

      </Card>
      {/* Case Cards */}

      {cases.length === 0 ? (
        <p className="text-muted-foreground text-center">No cases found for this client.</p>
      ) : (
        cases.map((item, idx) => {
          const isOpen = expandedIndex === idx;
          const { id, case: caseData, TotalAmount } = item;

          return (
            <Card key={id} className="border shadow-md mb-5">
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
                      style={{ cursor: "pointer" }}
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
