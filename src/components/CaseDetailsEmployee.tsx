import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCaseID } from "@/service/case.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLoading } from "./LoadingContext";
import { type FinalDetails } from "./CaseDetailsAdmin";
import { useToast } from "@/context/ToastContext";


export default function CaseDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.state?.id;
  const { setLoading } = useLoading();
  const toast = useToast();
  const [caseData, setCaseData] = useState<FinalDetails>();

  useEffect(() => {
    if (!id) {
      toast.showToast('Error','Proper ID was not provided','error');
      return;
    }
    setLoading(true);
    getCaseID(id).then((resp) => {
      setCaseData(resp?.data);
    }).catch((err:any)=>{
      toast.showToast('Error fetching:',err,'error');
    })
    .finally(() => setLoading(false));
  }, [id, navigate]);

  const generalDetails = caseData?.generalDetail;
  const vehicleDetail = caseData?.vehicleDetail;
  const expireDetail = caseData?.expireDetail;
  const transactionDetail = caseData?.transactionDetail;
  const expenseDetail = caseData?.expenseDetail;
  // const logs = caseData?.logs;

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

  const formatDate = (dateStr: string | undefined) =>
    dateStr?.split("T")[0] ?? null;

  const RenderField = ({
  label,
  value,
  type = "auto", // "auto" | "text" | "date" | "currency"
}: {
  label: string;
  value: string | number | Date | null;
  type?: "auto" | "text" | "date" | "currency";
}) => {
  const displayValue = (() => {
    if (value === null || value === undefined) return "—";

    if (type === "currency") return `₹${value}`;
    if (type === "date" && typeof value === "string") {
      const date = new Date(value);
      return isNaN(date.getTime()) ? value.toString() : date.toLocaleDateString();
    }

    if (type === "auto") {
      const date = new Date(value);
      if (
        typeof value === "string" &&
        !isNaN(date.getTime()) &&
        value.includes("-") // e.g. "2024-06-01"
      ) {
        return date.toLocaleDateString();
      }
    }

    return value.toString();
  })();

    return (
      <div>
        <Label className="text-sm text-muted-foreground">{label}</Label>
        <div className="border p-2 rounded-md bg-muted">{displayValue}</div>
      </div>
    );
  };


  const getBoolStatus = (bool: boolean | undefined) => {
    if (bool === true) return "Yes";
    if (bool === false) return "No";
    return "NA";
  };

  return (
    <div className="p-6 space-y-6">
      <button
      style={{cursor:"pointer"}}
        className="sticky top-4 cursor-pointer z-50 mb-4 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
        onClick={() => navigate(-1)}
        type="button"
      >
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">
        Case Details: #{caseData?.CaseNo}
      </h1>

      <Section title="General Details">
        <RenderField label="Firm Name" value={generalDetails?.firmName ?? ""} />

        {/* <RenderField
          label="Incentive Type"
          value={generalDetails?.incentiveType ?? ""}
        /> */}
      </Section>

      <Section title="Vehicle Details">
        <RenderField
          label="Vehicle No"
          value={vehicleDetail?.vehicleNo ?? null}
        />
        <RenderField label="From RTO" value={vehicleDetail?.fromRTO ?? null} />
        <RenderField label="To RTO" value={vehicleDetail?.toRTO ?? null} />
        <RenderField
          label="Chassis No"
          value={vehicleDetail?.chassisNo ?? null}
        />
        <RenderField
          label="Engine No"
          value={vehicleDetail?.engineNo ?? null}
        />
      </Section>

      <Section title="Expire Details">
        <RenderField
          label="Insurance Expiry"
          value={formatDate(expireDetail?.insuranceExpiry) ?? null}
        />
        <RenderField
          label="PUC Expiry"
          value={formatDate(expireDetail?.pucExpiry) ?? null}
        />
        <RenderField
          label="Fitness Expiry"
          value={formatDate(expireDetail?.fitnessExpiry) ?? null}
        />
        <RenderField
          label="Tax Expiry"
          value={formatDate(expireDetail?.taxExpiry) ?? null}
        />
        <RenderField
          label="Permit Expiry"
          value={formatDate(expireDetail?.permitExpiry) ?? null}
        />
      </Section>

      <Section title="Transaction Details">
        <RenderField label="To RTO" value={transactionDetail?.to ?? null} />
        <RenderField
          label="Fitness"
          value={getBoolStatus(transactionDetail?.fitness)}
        />
        <RenderField label="RRF" value={getBoolStatus(transactionDetail?.rrf)} />
        <RenderField label="RMA" value={getBoolStatus(transactionDetail?.rma)} />
        <RenderField
          label="Alteration"
          value={getBoolStatus(transactionDetail?.alteration)}
        />
        <RenderField
          label="Conversion"
          value={getBoolStatus(transactionDetail?.conversion)}
        />
        <RenderField
          label="Number Plate Type"
          value={transactionDetail?.numberPlate ?? null}
        />
        <RenderField
          label="Address Change"
          value={getBoolStatus(transactionDetail?.addressChange)}
        />
        <RenderField label="DRC" value={getBoolStatus(transactionDetail?.drc)} />
        <RenderField
          label="Remarks"
          value={transactionDetail?.remarks ?? null}
        />
      </Section>

      <Section title="Expense Details">
        <RenderField
          label="PUC Charges"
          value={expenseDetail?.pucCharges ?? null}
        />
        <RenderField
          label="Insurance Charges"
          value={expenseDetail?.insuranceCharges ?? null}
        />
        <RenderField
          label="Other Charges"
          value={expenseDetail?.otherCharges ?? null}
        />
        {/* <RenderField
          label="Admin Charges"
          value={expenseDetail?.adminCharges ?? null}
        /> */}
      </Section>
      {/* <Section title="Logs">
  
      <RenderField label="Status [From]" value={logs?.fromStatus ?? null} />
      <RenderField label="Status [To]" value={logs?.toStatus ?? null} />
      <RenderField
        label="Name"
        value={`${logs?.user?.firstName ?? ""} ${logs?.user?.lastName ?? ""}`.trim()}
      />
      <RenderField label="Email" value={logs?.user?.email ?? null} />
      <RenderField label="UserRole" value={logs?.user?.role ?? null} />
</Section> */}
    </div>
  );
}
