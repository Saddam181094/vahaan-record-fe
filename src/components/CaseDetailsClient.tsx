import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCaseID } from "@/service/case.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLoading } from "./LoadingContext";
import { useToast } from "@/context/ToastContext";

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

export default function CaseDescription() {
    const location = useLocation();
    const navigate = useNavigate();
    const id = location.state?.id;
    const { setLoading } = useLoading();
    const [caseData, setCaseData] = useState<DetailedCase>();
    const toast = useToast();

    useEffect(() => {
        if (!id) {
            toast.showToast('Error','Proper ID was not provided','error');
            return;
        }

        setLoading(true);
        getCaseID(id)
            .then((resp) => {
                setCaseData(resp?.data);
            })
            .catch((err:any)=>{
                toast.showToast('Error fetching:',err,'error');
            })
            .finally(() => setLoading(false));
    }, [id, navigate]);

    const formatDate = (dateStr: string | undefined) =>
        dateStr?.split("T")[0] ?? null;

    const Section = ({
        title,
        children,
    }: {
        title: string;
        children: React.ReactNode;
    }) => (
        <Card className="mb-6">
            <CardHeader className="text-lg font-semibold">{title}</CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children}
            </CardContent>
        </Card>
    );

    const RenderField = ({
        label,
        value,
    }: {
        label: string;
        value: any;
    }) => (
        <div>
            <Label className="text-sm text-muted-foreground">{label}</Label>
            <div className="border p-2 rounded-md bg-muted">
                {typeof value === "boolean"
                    ? value
                        ? "Yes"
                        : "No"
                    : value?.toString() || "—"}
            </div>
        </div>
    );

    const getBoolStatus = (bool: boolean | undefined) => {
        if (bool === true) return "Yes";
        if (bool === false) return "No";
        return "NA";
    };

    const caseNo = caseData?.CaseNo;
    const gd = caseData?.generalDetail;
    const vd = caseData?.vehicleDetail;
    const ed = caseData?.expireDetail;
    const td = caseData?.transactionDetail;

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <button
                style={{cursor:"pointer"}}
                    className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
                    onClick={() => navigate(-1)}
                    type="button"
                >
                    ← Back
                </button>
            </div>

            <h1 className="text-2xl font-bold mb-4">Case Details: #{caseNo}</h1>

            <Section title="General Details">
                <RenderField
                    label="Firm Name"
                    value={gd?.firmName}
                />
                <RenderField
                    label="Application Date"
                    value={gd?.applicationDate}
                />
            </Section>

            <Section title="Vehicle Details">
                <RenderField
                    label="Vehicle No"
                    value={vd?.vehicleNo}
                />
                <RenderField
                    label="From RTO"
                    value={vd?.fromRTO}
                />
                <RenderField
                    label="To RTO"
                    value={vd?.toRTO}
                />
                <RenderField
                    label="Chassis No"
                    value={vd?.chassisNo}
                />
                <RenderField
                    label="Engine No"
                    value={vd?.engineNo}
                />
            </Section>

            <Section title="Expire Details">
                <RenderField
                    label="Insurance Expiry"
                    value={formatDate(ed?.insuranceExpiry)}
                />
                <RenderField
                    label="PUC Expiry"
                    value={formatDate(ed?.pucExpiry)}
                />
                <RenderField
                    label="Fitness Expiry"
                    value={formatDate(ed?.fitnessExpiry)}
                />
                <RenderField
                    label="Tax Expiry"
                    value={formatDate(ed?.taxExpiry)}
                />
                <RenderField
                    label="Permit Expiry"
                    value={formatDate(ed?.permitExpiry)}
                />
            </Section>

            <Section title="Transaction Details">
                <RenderField
                    label="To RTO"
                    value={td?.to}
                />
                <RenderField
                    label="Fitness"
                    value={getBoolStatus(td?.fitness)}
                />
                <RenderField
                    label="RRF"
                    value={getBoolStatus(td?.rrf)}
                />
                <RenderField
                    label="RMA"
                    value={getBoolStatus(td?.rma)}
                />
                <RenderField
                    label="Alteration"
                    value={getBoolStatus(td?.alteration)}
                />
                <RenderField
                    label="Conversion"
                    value={getBoolStatus(td?.conversion)}
                />
                <RenderField
                    label="Number Plate Type"
                    value={td?.numberPlate}
                />
                <RenderField
                    label="Address Change"
                    value={getBoolStatus(td?.addressChange)}
                />
                <RenderField
                    label="DRC"
                    value={getBoolStatus(td?.drc)}
                />
                <RenderField
                    label="Remarks"
                    value={td?.remarks}
                />
            </Section>
        </div>
    );
}
