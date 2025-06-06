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
import { makePayment } from "@/service/case.service"; // You should implement this service

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
}

export default function ClientCaseList() {
  const [cases, setCases] = useState<ClientCase[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    getClientCases()
      .then((resp) => {
        setCases(resp?.data || []);
      })
      .catch((err: any) => {
        toast.showToast("Error fetching cases", err.message || err, "error");
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleCard = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const toggleSelect = (id: string) => {
    setSelectedCaseIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleMakePayment = async () => {
    if (selectedCaseIds.length === 0) {
      toast.showToast("No cases selected", "Please select at least one case.", "warning");
      return;
    }

    try {
      setLoading(true);
      await makePayment(selectedCaseIds); // your backend API call
      toast.showToast("Payment initiated", "Redirecting...", "success");
      // optionally clear selection or redirect
    } catch (err: any) {
      toast.showToast("Payment failed", err.message || err, "error");
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

  return (
    <div className="p-4 space-y-4 h-screen">
<div className="flex justify-between items-center mb-4">
  <h1 className="text-xl font-bold">Your Cases</h1>
  {!selectMode ? (
    <Button style={{cursor:"pointer"}} variant="default" onClick={() => setSelectMode(true)}>
      Make Payment
    </Button>
  ) : (
    <div className="flex gap-2">
      <Button 
      style={{cursor:"pointer"}}
      variant="outline" onClick={() => {
        setSelectMode(false);
        setSelectedCaseIds([]);
      }}>
        Cancel
      </Button>
      <Button
      style={{cursor:"pointer"}}
        variant="default"
        onClick={handleMakePayment}
        disabled={selectedCaseIds.length === 0}
      >
        Proceed
      </Button>
    </div>
  )}
</div>


      {cases.map((item, idx) => {
        const isOpen = expandedIndex === idx;
        const { id,case: caseData, TotalAmount } = item;

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
