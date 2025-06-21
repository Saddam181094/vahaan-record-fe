import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"; // make sure this exists or use another checkbox
import { useLoading } from "@/components/LoadingContext";
import { getClientCases } from "@/service/case.service";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/context/ToastContext";
// Assuming you have a function like this:
import { postIds } from "@/service/case.service"; // You should implement this service

interface ClientCase {
  id: string;
  TotalAmount: string;
  case: {
    id: string;
    CaseNo: number;
    status: string;
    createdAt: string;
    vehicleDetail: {
      vehicleNo: string;
    };
  };
  payment: payment;
}

export interface payment {
  id: string;
  mode: string;
  status: string;
}
export interface PaymentMode {
  CASH: 'CASH',
  UPI: 'UPI',
  CREDIT: 'CREDIT',
}

export default function ClientCaseList() {
  const [activeTab, setActiveTab] = useState<"verified" | "under-verification" | "unpaid">("under-verification");
  const [cases, setCases] = useState<ClientCase[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [selectedAmounts, setSelectedAmounts] = useState<number[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    getClientCases()
      .then((resp) => {
        const caseData = resp?.data || [];
        setCases(caseData);

        if (caseData.length === 0) {
          toast.showToast('Information:', 'No Cases to make Payment for', 'info');
        }
      })
      .catch((err: any) => {
        toast.showToast("Error:", err?.message || 'Error fetching your Cases', "error");
      })
      .finally(() => {
        setLoading(false)
      });
  }, []);

  const toggleCard = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const [selectedCaseNos, setSelectedCaseNos] = useState<number[]>([]);

  const toggleSelect = (id: string) => {
    const isSelected = selectedCaseIds.includes(id);
    const selectedCase = cases.find((c) => c.id === id);

    if (!selectedCase) return;

    if (isSelected) {
      const indexToRemove = selectedCaseIds.indexOf(id); // Get the current index BEFORE state updates

      setSelectedCaseIds((prev) => prev.filter((cid) => cid !== id));
      setSelectedAmounts((prev) => prev.filter((_, idx) => idx !== indexToRemove));
      setSelectedCaseNos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    } else {
      setSelectedCaseIds((prev) => [...prev, id]);
      setSelectedAmounts((prev) => [...prev, parseFloat(selectedCase.TotalAmount || "0")]);
      setSelectedCaseNos((prev) => [...prev, Number(selectedCase.case.CaseNo)]);
    }
  };



  const handleMakePayment = async () => {
    if (selectedCaseIds.length === 0) {
      toast.showToast("No cases selected", "Please select at least one case.", "warning");
      return;
    }

    try {
      setLoading(true);
      await postIds(selectedCaseIds); // your backend API call
      toast.showToast("Payment initiated", "Redirecting...", "success");
      // optionally clear selection or redirect

      setTimeout(() => {
        navigate("/client/payment", {
          state: {
            paidCaseIds: selectedCaseIds,
            totalPayable: selectedAmounts,
            caseNos: selectedCaseNos
          },
        });
      }, 1500);
    } catch (err: any) {
      toast.showToast("Error:", err?.message || 'Payment failed due to an error', "error");
    } finally {
      setLoading(false);
    }
  };

  const RenderField = ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="border p-2 rounded-md bg-muted text-sm">{value ?? "—"}</div>
    </div>
  );

const filteredCases = cases.filter((c) => {
  if (activeTab === "verified") return c.payment?.status === "success";
  if (activeTab === "under-verification") return c.payment?.status === "Paid";
  return c.payment === null; // unpaid
});


  return (
    <div className="p-4 space-y-4 h-screen">
      <h1 className="text-xl font-bold">Your Cases</h1>
      {activeTab === "unpaid" && (
  <div className="flex justify-end items-center mb-4">
    {!selectMode ? (
      filteredCases.length === 0 ? (
        <Button style={{ cursor: "pointer" }} variant="default" disabled>
          Make Payment
        </Button>
      ) : (
        <Button
          style={{ cursor: "pointer" }}
          variant="default"
          onClick={() => setSelectMode(true)}
        >
          Make Payment
        </Button>
      )
    ) : (
      <div className="flex gap-2">
        <Button
          style={{ cursor: "pointer" }}
          variant="outline"
          onClick={() => {
            setSelectMode(false);
            setSelectedCaseIds([]);
          }}
        >
          Cancel
        </Button>
        <Button
          style={{ cursor: "pointer" }}
          variant="default"
          onClick={handleMakePayment}
          disabled={selectedCaseIds.length === 0}
        >
          Proceed
        </Button>
      </div>
    )}
  </div>
)}


      <div className="flex gap-2 mb-4">
  <Button
    variant={activeTab === "verified" ? "default" : "outline"}
    onClick={() => {
      setActiveTab("verified");
      setSelectMode(false); // disable selection
    }}
  >
    Verified
  </Button>
  <Button
    variant={activeTab === "under-verification" ? "default" : "outline"}
    onClick={() => {
      setActiveTab("under-verification");
      setSelectMode(false);
    }}
  >
    Under Verification
  </Button>
  <Button
    variant={activeTab === "unpaid" ? "default" : "outline"}
    onClick={() => {
      setActiveTab("unpaid");
    }}
  >
    Unpaid
  </Button>
</div>

{filteredCases.length === 0 && (
  <div className="text-center text-muted-foreground py-10 text-sm border rounded-md">
    No cases found in "{activeTab}".
  </div>
)}


      {filteredCases
        .map((item, idx) => {
          const isOpen = expandedIndex === idx;
          const { id, case: caseData, TotalAmount } = item;

          return (
            <Card key={item.id} className="border shadow-md">
              <CardHeader
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleCard(idx)}
              >
                <div className="flex items-center gap-4">
                  {selectMode && (
                    <Checkbox
                      checked={selectedCaseIds.includes(id)}
                      disabled={item.payment !== null} // ❗ Prevent selection if paid
                      onCheckedChange={() => toggleSelect(id)}
                      onClick={(e: any) => e.stopPropagation()}
                    />
                  )}

                  <div>
                    <h2 className="font-semibold text-lg">Case #{caseData.CaseNo}</h2>
                    <p className="text-sm text-muted-foreground">{caseData.status}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp /> : <ChevronDown />}
              </CardHeader>

              {isOpen && (
                <CardContent className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <RenderField label="Vehicle No" value={caseData.vehicleDetail?.vehicleNo} />
                    <RenderField
                      label="Created On"
                      value={new Date(caseData.createdAt).toLocaleDateString()}
                    />
                    <RenderField label="Total Amount" value={`₹${(+TotalAmount).toFixed(2)}/-`} />
                    <RenderField label="Status" value={caseData.status} />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        navigate(`/client/cases/${caseData.CaseNo}`, {
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
        })}
    </div>
  );
}
