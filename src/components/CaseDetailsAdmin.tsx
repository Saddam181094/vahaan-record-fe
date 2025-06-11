import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type {
  GeneralDetails,
  TransactionDetail,
  ExpenseDetail,
  ExpireDetail,
  VehicleDetail,
  Case,
} from "@/components/CaseForm";
import { getCaseID, updateCaseID } from "@/service/case.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLoading } from "./LoadingContext";
// import { Switch } from "@radix-ui/react-switch";
import { useToast } from "@/context/ToastContext";
import { DateInput } from "./ui/date-input";
import { Switch } from "./ui/switch";
// import CaseDetails from "./CaseDetailsEmployee";

export interface FinalDetails {
  CaseNo: string;
  generalDetail: GeneralDetails;
  vehicleDetail: VehicleDetail;
  expireDetail: ExpireDetail;
  transactionDetail: TransactionDetail;
  expenseDetail: ExpenseDetail;
  logs: Logs;
}

export interface Logs {
  user: user;
  fromStatus: string;
  toStatus: string;
}

export interface user {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function CaseDescription() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.state?.id;
  const state = location.state?.status;
  const { setLoading } = useLoading();
  const [refreshFlag] = useState(false);
  const [caseData, setCaseData] = useState<FinalDetails>();
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState<string | undefined>();
  const toast = useToast();

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<FinalDetails>({
    // defaultValues: caseData,
  });

  useEffect(() => {
    setStatus(state);
  }, [refreshFlag])

  useEffect(() => {
    if (!id) {
      toast.showToast('Error', 'Proper ID was not provided', 'error');
      // alert("No ID provided");
      return;
    }

    setLoading(true);
    getCaseID(id)
      .then((resp) => {
        // console.log(resp?.data);
        setCaseData(resp?.data);
      }).catch((err: any) => {
        toast.showToast('Error:', err?.message || 'Some error Occured during fetch', 'error');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  useEffect(() => {
    if (caseData) {
      reset(caseData);
    }
  }, [caseData, reset]);

  const stripIds = <T extends object>(obj: T): Partial<T> => {
    const { id, ...rest } = obj as any;
    return rest;
  };
  const formatDate = (dateStr: string | undefined): string | undefined =>
    dateStr?.split("T")[0] ?? undefined;


  const onSubmit = async (data: FinalDetails) => {
    try {
      setLoading(true);
      const casePayload: Case = {
        generalDetails: stripIds(data.generalDetail) as GeneralDetails,
        vehicleDetail: stripIds(data.vehicleDetail) as VehicleDetail,
        expireDetail: {
          ...stripIds(data.expireDetail),
          insuranceExpiry: formatDate(data.expireDetail.insuranceExpiry),
          pucExpiry: formatDate(data.expireDetail.pucExpiry),
          fitnessExpiry: formatDate(data.expireDetail.fitnessExpiry),
          taxExpiry: formatDate(data.expireDetail.taxExpiry),
          permitExpiry: formatDate(data.expireDetail.permitExpiry),
        } as ExpireDetail,
        transactionDetail: stripIds(
          data.transactionDetail
        ) as TransactionDetail,
        expenseDetail: stripIds(data.expenseDetail) as ExpenseDetail,
      };

      await updateCaseID(id, casePayload);
      toast.showToast('Success', 'Case Successfully Updated', 'success');
      reset(casePayload);
      setEditMode(false);
    } catch (err: any) {
      // console.error(err);
      toast.showToast('Error in Updating:', err, 'error');
    } finally {
      // navigate(-1)
      setLoading(false);
    }
  };

  const getFormattedCaseData = (data: FinalDetails): FinalDetails => ({
    ...data,
    expireDetail: {
      ...data.expireDetail,
      insuranceExpiry: formatDate(data.expireDetail.insuranceExpiry) ?? "",
      pucExpiry: formatDate(data.expireDetail.pucExpiry) ?? "",
      fitnessExpiry: formatDate(data.expireDetail.fitnessExpiry) ?? "",
      taxExpiry: formatDate(data.expireDetail.taxExpiry) ?? "",
      permitExpiry: formatDate(data.expireDetail.permitExpiry) ?? "",
    }
  });


  const onCancel = () => {
    if (caseData) {
      reset(getFormattedCaseData(caseData));
    }
    setEditMode(false);
  };


  useEffect(() => {
    if (caseData) {
      reset(getFormattedCaseData(caseData));
    }
  }, [caseData, reset]);



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
    name,
    type = "text",
  }: {
    label: string;
    value: any;
    name: string;
    type?: string;
  }) => (
    <div>
      <Label className="text-sm text-muted-foreground">{label}</Label>
      {editMode ? (
        type === "switch" ? (
          <Controller
            name={name as any}
            control={control}
            render={({ field }) => (
              <Switch
                checked={!!field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        ) : type === "date" ? (
          <Controller
            name={name as any}
            control={control}
            render={({ field, fieldState }) => (
              <DateInput
                id={name}
                error={!!fieldState.error}
                value={
                  typeof field.value === "string"
                    ? field.value
                    : ""
                }
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        ) : (
          <Controller
            name={name as any}
            control={control}
            render={({ field }) => (
              <input
                type={type}
                {...field}
                className="border p-2 rounded-md w-full"
              />
            )}
          />
        )
      ) : (
        <div className="border p-2 rounded-md bg-muted">
          {typeof value === "boolean"
            ? value
              ? "Yes"
              : "No"
            : value?.toString() || "—"}
        </div>
      )}
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
  const exd = caseData?.expenseDetail;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <button
          style={{ cursor: "pointer" }}
          className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90"
          onClick={() => navigate(-1)}
          type="button"
        >
          ← Back
        </button>

        {status?.toLowerCase() === "assigned" ? null : (
          !editMode ? (
            <button
              style={{ cursor: "pointer" }}
              className="px-4 py-2 rounded bg-secondary text-primary border border-primary hover:bg-secondary/80"
              onClick={() => setEditMode(true)}
              type="button"
            >
              ✎ Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                style={{ cursor: "pointer" }}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                type="submit"
                disabled={isSubmitting}
              >
                Save
              </button>
              <button
                style={{ cursor: "pointer" }}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={() => { onCancel(); }}
                type="button"
              >
                ✖ Cancel
              </button>
            </div>
          )
        )}
      </div>

      <h1 className="text-2xl font-bold mb-4">Case Details: #{caseNo}</h1>

      <Section title="General Details">
        <RenderField
          label="Firm Name"
          value={gd?.firmName}
          name="generalDetail.firmName"
        />
        <RenderField
          label="Incentive Type"
          value={gd?.incentiveType}
          name="generalDetail.incentiveType"
        />
      </Section>

      <Section title="Vehicle Details">
        <RenderField
          label="Vehicle No"
          value={vd?.vehicleNo}
          name="vehicleDetail.vehicleNo"
        />
        <RenderField
          label="From RTO"
          value={vd?.fromRTO}
          name="vehicleDetail.fromRTO"
        />
        <RenderField
          label="To RTO"
          value={vd?.toRTO}
          name="vehicleDetail.toRTO"
        />
        <RenderField
          label="Chassis No"
          value={vd?.chassisNo}
          name="vehicleDetail.chassisNo"
        />
        <RenderField
          label="Engine No"
          value={vd?.engineNo}
          name="vehicleDetail.engineNo"
        />
      </Section>

      <Section title="Expire Details">
        <RenderField
          label="Insurance Expiry"
          value={formatDate(ed?.insuranceExpiry)}
          name="expireDetail.insuranceExpiry"
          type="date"
        />
        <RenderField
          label="PUC Expiry"
          value={formatDate(ed?.pucExpiry)}
          name="expireDetail.pucExpiry"
          type="date"
        />
        <RenderField
          label="Fitness Expiry"
          value={formatDate(ed?.fitnessExpiry)}
          name="expireDetail.fitnessExpiry"
          type="date"
        />
        <RenderField
          label="Tax Expiry"
          value={formatDate(ed?.taxExpiry)}
          name="expireDetail.taxExpiry"
          type="date"
        />
        <RenderField
          label="Permit Expiry"
          value={formatDate(ed?.permitExpiry)}
          name="expireDetail.permitExpiry"
          type="date"
        />
      </Section>

      <Section title="Transaction Details">
        <RenderField
          label="To RTO"
          value={td?.to}
          name="transactionDetail.to"
        />
        <RenderField
          label="Fitness"
          value={getBoolStatus(td?.fitness)}
          name="transactionDetail.fitness"
          type="switch"
        />
        <RenderField
          label="RRF"
          value={getBoolStatus(td?.rrf)}
          name="transactionDetail.rrf"
          type="switch"
        />
        <RenderField
          label="RMA"
          value={getBoolStatus(td?.rma)}
          name="transactionDetail.rma"
          type="switch"
        />
        <RenderField
          label="Alteration"
          value={getBoolStatus(td?.alteration)}
          name="transactionDetail.alteration"
          type="switch"
        />
        <RenderField
          label="Conversion"
          value={getBoolStatus(td?.conversion)}
          name="transactionDetail.conversion"
          type="switch"
        />
        <RenderField
          label="Number Plate Type"
          value={td?.numberPlate}
          name="transactionDetail.numberPlate"
        />
        <RenderField
          label="Address Change"
          value={getBoolStatus(td?.addressChange)}
          name="transactionDetail.addressChange"
          type="switch"
        />
        <RenderField
          label="DRC"
          value={getBoolStatus(td?.drc)}
          name="transactionDetail.drc"
          type="switch"
        />
        <RenderField
          label="Remarks"
          value={td?.remarks}
          name="transactionDetail.remarks"
        />
      </Section>

      <Section title="Expense Details">
        <RenderField
          label="PUC Charges"
          value={exd?.pucCharges}
          name="expenseDetail.pucCharges"
        />
        <RenderField
          label="Insurance Charges"
          value={exd?.insuranceCharges}
          name="expenseDetail.insuranceCharges"
        />
        <RenderField
          label="Other Charges"
          value={exd?.otherCharges}
          name="expenseDetail.otherCharges"
        />
        <RenderField
          label="Admin Charges"
          value={exd?.adminCharges}
          name="expenseDetail.adminCharges"
        />
      </Section>
    </form>
  );
}
