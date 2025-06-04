import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLoading } from "@/components/LoadingContext";
import { getClientCases, getCaseID} from "@/service/case.service";
import { useNavigate } from "react-router-dom";

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

interface DetailedCase {
  id: string;
  CaseNo: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  vehicleDetail: {
    vehicleNo: string;
    fromRTO: string;
    toRTO: string;
    chassisNo: string;
    engineNo: string;
  };
  expireDetail: {
    insuranceExpiry: string;
    pucExpiry: string;
    fitnessExpiry: string;
    taxExpiry: string;
    permitExpiry: string;
  };
  transactionDetail: {
    to: string;
    fitness: boolean;
    rrf: boolean;
    rma: boolean;
    alteration: boolean;
    conversion: boolean;
    numberPlate: string;
    addressChange: boolean;
    drc: boolean;
    remarks: string;
  };
  generalDetail: {
    firmName: string;
    applicationDate: string | null;
  };
}

export default function ClientCaseList() {
  const [cases, setCases] = useState<ClientCase[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [detailedCase, setDetailedCase] = useState<DetailedCase | null>(null);
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

  const fetchCaseDetails = async (caseId: string) => {
    setLoading(true);
    try {
      const response = await getCaseID(caseId);
      setDetailedCase(response.data);
      setDialogOpen(true);
    } catch (error) {
      console.error("Error fetching case details:", error);
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
                  <RenderField label="Total Amount" value={`₹${(+TotalAmount).toFixed(2)}/-`} />
                  <RenderField label="Status" value={caseData.status} />
                </div>
                <div className="flex justify-end">
                  <Button
                    onClick={() =>                         
                    navigate(`/client/cases/${caseData.CaseNo}`, {
                        state: { id: caseData.id }
                        })}
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
