import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import type { GeneralDetails,TransactionDetail,ExpenseDetail,ExpireDetail,VehicleDetail } from "@/components/CaseForm";
import { getCaseID } from "@/service/case.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export interface FinalDetails {
  CaseNo: string,
  generalDetail : GeneralDetails
  vehicleDetail : VehicleDetail
  expireDetail : ExpireDetail
  transactionDetail : TransactionDetail, 
  expenseDetail : ExpenseDetail
}

export default function YourTargetPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.state?.id;

  const [caseData, setCaseData] = useState<FinalDetails>();

  useEffect(() => {
    if (!id) {
      alert("No ID provided");
      return;
    }

    getCaseID(id).then((resp) => {
      setCaseData(resp?.data);
    });
  }, [id, navigate]);


  const generalDetails = caseData?.generalDetail;
  const vehicleDetail = caseData?.vehicleDetail;
  const expireDetail = caseData?.expireDetail;
  const transactionDetail = caseData?.transactionDetail;
  const expenseDetail = caseData?.expenseDetail;

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <Card className="mb-6">
      <CardHeader className="text-lg font-semibold">{title}</CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {children}
      </CardContent>
    </Card>
  );

  const RenderField = ({ label, value }: { label: string; value: string | number | boolean | null }) => (
    <div>
      <Label className="text-sm text-muted-foreground">{label}</Label>
      <div className="border p-2 rounded-md bg-muted">{value?.toString() || "—"}</div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
<button
  className="sticky top-4 z-50 mb-4 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
  onClick={() => navigate(-1)}
  type="button"
>
  ← Back
</button>

      <h1 className="text-2xl font-bold mb-4">Case Details: #{caseData?.CaseNo}</h1>

      <Section title="General Details">
        <RenderField label="Firm Name" value={generalDetails?.firmName ?? ""} />
        <RenderField label="Dealer Code" value={generalDetails?.dealerCode?? ""} />
        <RenderField label="Incentive Type" value={generalDetails?.incentiveType?? ""} />
      </Section>

      <Section title="Vehicle Details">
        <RenderField label="Vehicle No" value={vehicleDetail?.vehicleNo ?? null} />
        <RenderField label="From RTO" value={vehicleDetail?.fromRTO ?? null} />
        <RenderField label="To RTO" value={vehicleDetail?.toRTO ?? null} />
        <RenderField label="Chassis No" value={vehicleDetail?.chassisNo ?? null} />
        <RenderField label="Engine No" value={vehicleDetail?.engineNo ?? null} />
      </Section>

      <Section title="Expire Details">
        <RenderField label="Insurance Expiry" value={expireDetail?.insuranceExpiry ?? null} />
        <RenderField label="PUC Expiry" value={expireDetail?.pucExpiry ?? null} />
        <RenderField label="Fitness Expiry" value={expireDetail?.fitnessExpiry ?? null} />
        <RenderField label="Tax Expiry" value={expireDetail?.taxExpiry ?? null} />
        <RenderField label="Permit Expiry" value={expireDetail?.permitExpiry ?? null} />
      </Section>

      <Section title="Transaction Details">
        <RenderField label="To RTO" value={transactionDetail?.to ?? null} />
        <RenderField label="Fitness" value={transactionDetail?.fitness ?? null} />
        <RenderField label="RRF" value={transactionDetail?.rrf ?? null} />
        <RenderField label="RMA" value={transactionDetail?.rma ?? null} />
        <RenderField label="Alteration" value={transactionDetail?.alteration ?? null} />
        <RenderField label="Conversion" value={transactionDetail?.conversion ?? null} />
        <RenderField label="Number Plate Type" value={transactionDetail?.numberPlate ?? null} />
        <RenderField label="Address Change" value={transactionDetail?.addressChange ?? null} />
        <RenderField label="DRC" value={transactionDetail?.drc ?? null} />
        <RenderField label="Remarks" value={transactionDetail?.remarks ?? null} />
      </Section>

      <Section title="Expense Details">
        <RenderField label="PUC Charges" value={expenseDetail?.pucCharges ?? null} />
        <RenderField label="Insurance Charges" value={expenseDetail?.insuranceCharges ?? null} />
        <RenderField label="Other Charges" value={expenseDetail?.otherCharges ?? null} />
        <RenderField label="Admin Charges" value={expenseDetail?.adminCharges ?? null} />
      </Section>
    </div>
  );
}
