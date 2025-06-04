import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLoading } from "@/components/LoadingContext";
import { getClientCases } from "@/service/case.service";

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
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    getClientCases()
      .then((resp) => {
        setCases(resp?.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleCard = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const RenderField = ({ label, value }: { label: string; value: string | number }) => (
    <div>
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="border p-2 rounded-md bg-muted text-sm">{value ?? "—"}</div>
    </div>
  );

  return (
    <div className="p-4 space-y-4 h-screen">

      <h1 className="text-xl font-bold mb-4">Your Cases</h1>

      {cases.map((item, idx) => {
        const isOpen = expandedIndex === idx;
        const { case: caseData, TotalAmount } = item;

        return (
          <Card key={item.id} className="border shadow-md">
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
                  <RenderField label="Vehicle No" value={caseData.vehicleDetail?.vehicleNo} />
                  <RenderField
                    label="Created On"
                    value={new Date(caseData.createdAt).toLocaleDateString()}
                  />
                  <RenderField label="Total Amount" value={`₹${TotalAmount}`} />
                  <RenderField label="Status" value={caseData.status} />
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
