import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useReactToPrint } from "react-to-print";
// import type { UseReactToPrintOptions } from "react-to-print";
import type {
  GeneralDetails,
  TransactionDetail,
  ExpenseDetail,
  ExpireDetail,
  VehicleDetail,
  ownerDetails,
  Case,
} from "@/components/CaseForm";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { getCaseID, updateCaseID } from "@/service/case.service";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useLoading } from "./LoadingContext";
// import { Switch } from "@radix-ui/react-switch";
import { useToast } from "@/context/ToastContext";
import { DateInput } from "./ui/date-input";
import { Switch } from "./ui/switch";
// import { Input } from "./ui/input";
import { indianStates } from "./Branchform";
import { getActiveFirm } from "@/service/firm.service";
import type { Firm } from "./FirmForm";
import { NumberPlate } from "@/components/CaseForm";
import { useAuth } from "@/context/AuthContext";
// import { Button } from "./ui/button";
import { getFirmsD } from "@/service/client.service";
// import CaseDetails from "./CaseDetailsEmployee";

export interface FinalDetails {
  CaseNo: string;
  generalDetail: GeneralDetails;
  vehicleDetail: VehicleDetail;
  expireDetail: ExpireDetail;
  transactionDetail: TransactionDetail;
  expenseDetail: ExpenseDetail;
  ownerDetails?: ownerDetails;
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
  const [firms, setfirms] = useState<Firm[]>([]);
  const [refreshFlag] = useState(false);
  const [caseData, setCaseData] = useState<FinalDetails>();
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState<string | undefined>();
  const toast = useToast();
  const { user } = useAuth();
  const Numberplates = Object.values(NumberPlate);


  const [searchSellerState, setSearchSellerState] = useState("");
  const [searchBuyerState, setSearchBuyerState] = useState("");
  const [searchFirm, setSearchFirm] = useState("");
  const [firm,setFirm] = useState<[]>([]);

  const ind2 = indianStates.filter((hostel) =>
    hostel.toLowerCase().includes((searchSellerState).toLowerCase())
  );
  const ind3 = indianStates.filter((hostel) =>
    hostel.toLowerCase().includes((searchBuyerState).toLowerCase())
  );

  const [searchHPT, setSearchHPT] = useState("");
  const [searchHPA, setSearchHPA] = useState("");
  const {logout} = useAuth();


  const filteredfirms = firms.filter(f => f.name.toLowerCase().includes((searchHPA || searchHPT).toLowerCase()));


  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = useForm<FinalDetails>({
    // defaultValues: caseData,
  });

  useEffect(() => {
    setLoading(true);

    getActiveFirm()
      .then((resp) => {
        setfirms(resp?.data);
      })
      .catch((err: any) => {
        if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        toast.showToast('Error:', err?.message || 'Error during fetch of Firms', 'error');
      })
      .finally(() => setLoading(false));
  }, [refreshFlag]);

//   useEffect(() => {
//   setLoading(true);

//   getActiveFirm()
//     .then((resp) => {
//       const activeFirms = resp?.data;
//       setfirms(activeFirms);

//       const isHPTValid = activeFirms.some((firm:any) => firm.id === td?.hptId);
//       const isHPAValid = activeFirms.some((firm:any) => firm.id === td?.hpaId);

//       if (!isHPTValid && td?.hptId) {
//         toast.showToast("Warning", "Selected HPT firm is no longer active", "warning");
//       }
//       if (!isHPAValid && td?.hpaId) {
//         toast.showToast("Warning", "Selected HPA firm is no longer active", "warning");
//       }
//     })
//     .catch((err: any) => {
//       if (err?.status == '401' || err?.response?.status == '401') {
//         toast.showToast('Error', 'Session Expired', 'error');
//         logout();
//       }
//       toast.showToast('Error:', err?.message || 'Error during fetch of Firms', 'error');
//     })
//     .finally(() => setLoading(false));
// }, [refreshFlag]);


  useEffect(() => {
    setStatus(state);
  }, [refreshFlag])

   useEffect(() => {
      setLoading(true);
  
      getFirmsD()
        .then((resp) => {
          const f = resp?.data.map((f:string) => f.toUpperCase());
          setFirm(f);
        })
        .catch((err: any) => {
          if(err?.status == '401' || err?.response?.status == '401')
          {
            toast.showToast('Error', 'Session Expired', 'error');
            logout();
          }
          toast.showToast('Error:', err?.message || 'Error during fetch of Firms', 'error');
        })
        .finally(() => setLoading(false));
    }, [refreshFlag]);

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
        if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
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
        ownerDetails: stripIds(data.ownerDetails ?? {}) as ownerDetails,
      };

      await updateCaseID(id, casePayload);
      toast.showToast('Success', 'Case Successfully Updated', 'success');
      reset(casePayload);
      navigate(-1);
      setEditMode(false);
    } catch (err: any) {
      // console.error(err);
      if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
      else if (err?.response?.status === 400) {
        toast.showToast('Bad Request', 'Provide full owner details or none', 'error');
      } else {
        const errorMessage = err?.response?.data?.message || err?.message || 'Unknown error occurred.';
        toast.showToast('Error in Updating', errorMessage, 'error');
      }
    } finally {
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

  const getFirmNameById = (id: string | undefined) => {
    if (!id) return "—";
    const firm = firms.find(f => f.id === id);
    return firm ? firm.name : id;
  };

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

const Section2 = ({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`mb-6 ${className}`}>
    <h2 className="text-lg font-bold mb-2 border-b pb-1">{title}</h2>
    <div className="grid grid-cols-2 gap-4">{children}</div>
  </div>
);


  const PrintField = ({ label, value }: { label: string; value?: string | number | boolean }) => (
    <div className="mb-2">
      <span className="font-semibold">{label}:</span> {value || "-"}
    </div>
  );

  const RenderField = ({
    label,
    value,
    name,
    type = "text",
    options,
    search,
    setSearch,
    required,
    getOptionValue = (opt) => opt,     // Default: return whole string
    getOptionLabel = (opt) => opt,     // Default: return whole string
  }: {
    label: string;
    value: any;
    name: string;
    type?: string;
    options?: any[];
    search?: string;
    required?: boolean;
    setSearch?: (value: string) => void;
    getOptionValue?: (opt: any) => string;
    getOptionLabel?: (opt: any) => string;
  }) => (
    <div>
      <Label className="text-sm text-muted-foreground">{label}

        {required && <span className="text-red-500">*</span>}
      </Label>
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
        ) : options ? (
<Controller
  name={name as any}
  control={control}
  render={({ field }) => (
<Select
  onValueChange={field.onChange}
  value={field.value || ""}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    {setSearch && (
      <div className="px-2 py-1">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full px-2 py-1 text-sm border rounded"
        />
      </div>
    )}
    {(options ?? [])
      .filter((opt) =>
        !search
          ? true
          : getOptionLabel(opt).toLowerCase().includes(search.toLowerCase())
      )
      .map((opt) => (
        <SelectItem key={getOptionValue(opt)} value={getOptionValue(opt)}>
          {getOptionLabel(opt)}
        </SelectItem>
      ))}
  </SelectContent>
</Select>

  )}
/>

        ) : type === "Mobile" ? (
          <Controller
            name={name as any}
            control={control}
            rules={{
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: "Enter a valid 10-digit Indian phone number",
              },
            }}
            render={({ field, fieldState }) => (
              <>
                <input
                  type={type}
                  {...field}
                  maxLength={10}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, "");
                    field.onChange(val);
                  }}
                  className="border p-2 rounded-md w-full"
                />
                {fieldState.error && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        ) : type === "Aadhar" ? (
          <Controller
            name={name as any}
            control={control}
            rules={{
              pattern: {
                value: /^\d{12}$/,
                message: "Aadhaar No must be a 12-digit number",
              },
            }}
            render={({ field, fieldState }) => (
              <>
                <input
                  type={type}
                  {...field}
                  maxLength={12}
                  onChange={e => {
                    const val = e.target.value.replace(/\D/g, "");
                    field.onChange(val);
                  }}
                  className="border p-2 rounded-md w-full"
                />
                {fieldState.error && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </>
            )}
          />
        ) : (
          <Controller
            name={name as any}
            control={control}
            rules={{ required }}
            render={({ field, fieldState }) => (
              <>
                <input
                  type={type}
                  {...field}
                  className="border p-2 rounded-md w-full"
                />
                {fieldState.error && (
                  <p className="text-red-500 text-xs mt-1">
                    {fieldState.error.message}
                  </p>
                )}
              </>
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
  const owd = caseData?.ownerDetails;

const contentRef = useRef<HTMLDivElement>(null);
const reactToPrintFn = useReactToPrint({ contentRef });

  const PrintableCaseDetails = ({
    caseNo,
    generalDetail,
    vehicleDetail,
    expireDetail,
    transactionDetail,
    ownerDetails,
    expenseDetail,
  }: any) => {
    const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : "-");
    const getBool = (val?: boolean) => (val ? "Yes" : "No");

      useEffect(() => {
      // Listen to all input events, force uppercase
      const handler = (e:any) => {
        if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
          e.target.value = e.target.value.toUpperCase();
        }
      };
      document.addEventListener('input', handler, true);
      return () => document.removeEventListener('input', handler, true);
    }, []);


    return (
      <div id="printable-content" className="p-12 text-sm leading-relaxed">
        {/* Letterhead */}
        <div className="mb-6 border-b pb-4">
          <img
            src="/Group.svg"
            alt="Letterhead"
            className="mb-5 max-h-24"
          />
          <h1 className="text-xl font-bold mt-5">Case Details</h1>
          <p className="text-gray-600">Case No: #{caseNo}</p>
        </div>

        <Section2 title="General Details">
          <PrintField label="Firm Name" value={generalDetail?.firmName} />
          <PrintField label="Appointment Date" value={formatDate(generalDetail?.appointmentDate)} />
          <PrintField label="Application No." value={generalDetail?.applicationNo} />
          <PrintField label="Incentive Amount" value={generalDetail?.incentiveAmount} />
        </Section2>

        <Section2 title="Vehicle Details">
          <PrintField label="Vehicle No" value={vehicleDetail?.vehicleNo} />
          <PrintField label="From RTO" value={vehicleDetail?.fromRTO} />
          <PrintField label="To RTO" value={vehicleDetail?.toRTO} />
          <PrintField label="Chassis No" value={vehicleDetail?.chassisNo} />
          <PrintField label="Engine No" value={vehicleDetail?.engineNo} />
          <PrintField label="RMA Vehicle No" value={vehicleDetail?.rmaVehicleNo} />
        </Section2>

        <Section2 title="Expire Details">
          <PrintField label="Insurance Expiry" value={formatDate(expireDetail?.insuranceExpiry)} />
          <PrintField label="PUC Expiry" value={formatDate(expireDetail?.pucExpiry)} />
          <PrintField label="Fitness Expiry" value={formatDate(expireDetail?.fitnessExpiry)} />
          <PrintField label="Tax Expiry" value={formatDate(expireDetail?.taxExpiry)} />
          <PrintField label="Permit Expiry" value={formatDate(expireDetail?.permitExpiry)} />
        </Section2>

        <Section2 title="Transaction Details" className="break-before-page mt-10">
          <PrintField label="To RTO" value={transactionDetail?.to} />
          <PrintField label="HPT Firm" value={transactionDetail?.hptFirmName} />
          <PrintField label="HPA Firm" value={transactionDetail?.hpaFirmName} />
          <PrintField label="Fitness" value={getBool(transactionDetail?.fitness)} />
          <PrintField label="RRF" value={getBool(transactionDetail?.rrf)} />
          <PrintField label="RMA" value={getBool(transactionDetail?.rma)} />
          <PrintField label="Alteration" value={getBool(transactionDetail?.alteration)} />
          <PrintField label="Conversion" value={getBool(transactionDetail?.conversion)} />
          <PrintField label="Number Plate" value={transactionDetail?.numberPlate} />
          <PrintField label="Address Change" value={getBool(transactionDetail?.addressChange)} />
          <PrintField label="DRC" value={getBool(transactionDetail?.drc)} />
          <PrintField label="Remarks" value={transactionDetail?.remarks} />
        </Section2>

{owd && (<>
        <Section2 title="Seller Details">
          <PrintField label="Seller Name" value={ownerDetails?.sellerName} />
          <PrintField label="Seller Aadhar" value={ownerDetails?.sellerAadharNo} />
          <PrintField label="Seller Address" value={ownerDetails?.sellerAddress} />
          <PrintField label="Seller State" value={ownerDetails?.sellerState} />
          <PrintField label="Seller Phone" value={ownerDetails?.sellerPhoneNo} />
        </Section2>

        <Section2 title="Buyer Details">
          <PrintField label="Buyer Name" value={ownerDetails?.buyerName} />
          <PrintField label="Buyer Aadhar" value={ownerDetails?.buyerAadharNo} />
          <PrintField label="Buyer Address" value={ownerDetails?.buyerAddress} />
          <PrintField label="Buyer State" value={ownerDetails?.buyerState} />
          <PrintField label="Buyer Phone" value={ownerDetails?.buyerPhoneNo} />
        </Section2>
</>
)}
        <Section2 title="Expense Details">
          <PrintField label="PUC Charges" value={expenseDetail?.pucCharges} />
          <PrintField label="Insurance Charges" value={expenseDetail?.insuranceCharges} />
          <PrintField label="Other Charges" value={expenseDetail?.otherCharges} />
          <PrintField label="Admin Charges" value={expenseDetail?.adminCharges} />
        </Section2>
      </div>
    );
  };

  const [options,setOptions] = useState(false); 

useEffect(() => {
  if (!td) return;

  setLoading(true);

  getActiveFirm()
    .then((resp) => {
      const activeFirms = resp?.data || [];
      setfirms(activeFirms);

      const { hptId, hpaId } = td;

      const isHPTValid = activeFirms.some((firm: any) => firm.id === hptId);
      const isHPAValid = activeFirms.some((firm: any) => firm.id === hpaId);

      // Update invalid IDs to empty, so the field shows placeholder
      if (!isHPTValid && hptId) {
        setOptions(true);
        toast.showToast("Warning", "Selected HPT firm is no longer active", "warning");
        setCaseData((prev: any) => ({
          ...prev,
          transactionDetail: {
            ...prev.transactionDetail,
            hptId: undefined,
          }
        }));
      }

      if (!isHPAValid && hpaId) {
                setOptions(true);
        toast.showToast("Warning", "Selected HPA firm is no longer active", "warning");
        setCaseData((prev: any) => ({
          ...prev,
          transactionDetail: {
            ...prev.transactionDetail,
            hpaId: undefined,
          }
        }));
      }
    })
    .catch((err: any) => {
      if (err?.status === 401 || err?.response?.status === 401) {
        toast.showToast("Error", "Session Expired", "error");
        logout();
      } else {
        toast.showToast("Error", err?.message || "Error during fetch of Firms", "error");
      }
    })
    .finally(() => setLoading(false));
}, [td]);


const isDisabled = caseData? true : false;
  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
      {/* <div className="flex sm:flex-row justify-between items-center gap-4 mb-4"> */}
<div className="flex flex-wrap gap-2 w-full sm:flex-nowrap justify-between">
  {/* Back and Print */}
  <div className="flex sm:flex-row gap-2 w-full sm:w-auto justify-between">
    <button
      style={{ cursor: "pointer" }}
      className="px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 sm:w-auto"
      onClick={() => navigate(-1)}
      type="button"
    >
      ← Back
    </button>

    <button
      type="button"
      disabled={!isDisabled}
      style={{ cursor: "pointer" }}
      onClick={reactToPrintFn}
      className="bg-primary text-white sm:w-auto rounded px-4 py-2"
    >
      🖨️ Print PDF
    </button>
  </div>

  {/* Edit / Save + Cancel */}
  {status?.toLowerCase() === "assigned" ? null : (
    !editMode ? (
      <button
        style={{ cursor: "pointer" }}
        className="px-4 py-2 rounded bg-secondary text-primary border border-primary hover:bg-secondary/80 w-full sm:w-auto"
        onClick={() => setEditMode(true)}
        type="button"
      >
        ✎ Edit
      </button>
    ) : (
      <div className="flex sm:flex-row gap-2 w-full sm:w-auto">
        <button
          style={{ cursor: "pointer" }}
          className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 w-full sm:w-auto"
          type="submit"
          disabled={isSubmitting}
        >
          Save
        </button>
        <button
          style={{ cursor: "pointer" }}
          className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto"
          onClick={onCancel}
          type="button"
        >
          ✖ Cancel
        </button>
      </div>
    )
  )}
</div>



{options && <span className="text-red-500">Either HPA/HPT ID are from inactive field.</span>}

      <h1 className="text-2xl font-bold mb-4">Case Details: #{caseNo}</h1>

      <Section title="General Details">
        <RenderField
          label="Firm Name"
          required
          value={gd?.firmName}
          name="generalDetail.firmName"
          options={firm}
          search={searchFirm}
          setSearch={setSearchFirm}
        />
        {user?.role === "superadmin" &&
          <RenderField
            label="Incentive Amount"
            value={gd?.incentiveAmount}
            name="generalDetail.incentiveAmount"
          />}
        <RenderField
          label="Appointment Date"
          value={formatDate(gd?.appointmentDate)}
          name="generalDetail.appointmentDate"
          type="date"
        />
        <RenderField
          label="Application No."
          value={gd?.applicationNo}
          name="generalDetail.applicationNo"
        />
      </Section>

      <Section title="Vehicle Details">
        <RenderField
          label="Vehicle No"
          required
          value={vd?.vehicleNo}
          name="vehicleDetail.vehicleNo"
        />
        <RenderField
          label="From RTO"
          required
          value={vd?.fromRTO}
          name="vehicleDetail.fromRTO"
        />
        <RenderField
          label="To RTO"
          required
          value={vd?.toRTO}
          name="vehicleDetail.toRTO"
        />
        <RenderField
          label="Chassis No"
          required
          value={vd?.chassisNo}
          name="vehicleDetail.chassisNo"
        />
        <RenderField
          label="Engine No"
          required
          value={vd?.engineNo}
          name="vehicleDetail.engineNo"
        />
        <RenderField
          label="RMA Vehicle No"
          value={vd?.rmaVehicleNo}
          name="vehicleDetail.rmaVehicleNo"
        />
      </Section>

      <Section title="Expire Details">
        <RenderField
          label="Insurance Expiry"
          required
          value={formatDate(ed?.insuranceExpiry)}
          name="expireDetail.insuranceExpiry"
          type="date"
        />
        <RenderField
          label="PUC Expiry"
          required
          value={formatDate(ed?.pucExpiry)}
          name="expireDetail.pucExpiry"
          type="date"
        />
        <RenderField
          label="Fitness Expiry"
          required
          value={formatDate(ed?.fitnessExpiry)}
          name="expireDetail.fitnessExpiry"
          type="date"
        />
        <RenderField
          label="Tax Expiry"
          required
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
          required
          value={td?.to}
          name="transactionDetail.to"
        />
        <RenderField
          label="HPT ID"
          required
          value={editMode ? td?.hptId?? "" : getFirmNameById(td?.hptId)}
          name="transactionDetail.hptId"
          options={filteredfirms}
          search={searchHPT}
          setSearch={setSearchHPT}
          getOptionValue={opt => opt.id}
          getOptionLabel={opt => opt.name}
        />
        <RenderField
          label="HPA ID"
          required
          value={editMode ? td?.hpaId?? "" : getFirmNameById(td?.hpaId)}
          name="transactionDetail.hpaId"
          options={filteredfirms}
          search={searchHPA}
          setSearch={setSearchHPA}
          getOptionValue={opt => opt.id}
          getOptionLabel={opt => opt.name}
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
          required
          value={td?.numberPlate}
          name="transactionDetail.numberPlate"
          options={Numberplates}
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



      {owd && (
        <>     
        <Section title="Seller Details">
        <RenderField
          label="Seller Name"
          value={owd?.sellerName}
          name="ownerDetails.sellerName"
        />
        <RenderField
          label="Seller Aadhar Number"
          value={owd?.sellerAadharNo}
          name="ownerDetails.sellerAadharNo"
          type="Aadhar"
        />
        <RenderField
          label="Seller Address"
          value={owd?.sellerAddress}
          name="ownerDetails.sellerAddress"
        />
        <RenderField
          label="Seller State"
          value={owd?.sellerState}
          name="ownerDetails.sellerState"
          options={ind2}
          search={searchSellerState}
          setSearch={setSearchSellerState}
        />
        <RenderField
          label="Seller Mobile Number"
          value={owd?.sellerPhoneNo}
          name="ownerDetails.sellerPhoneNo"
          type="Mobile"
        />
      </Section>

      <Section title="Buyer Details">
        <RenderField
          label="Buyer Name"
          required
          value={owd?.buyerName}
          name="ownerDetails.buyerName"
        />
        <RenderField
          label="Buyer Aadhar Number"
          required
          value={owd?.buyerAadharNo}
          name="ownerDetails.buyerAadharNo"
          type="Aadhar"
        />
        <RenderField
          label="Buyer Address"
          required
          value={owd?.buyerAddress}
          name="ownerDetails.buyerAddress"
        />
        <RenderField
          label="Buyer State"
          required
          value={owd?.buyerState}
          name="ownerDetails.buyerState"
          options={ind3}
          search={searchBuyerState}
          setSearch={setSearchBuyerState}
        />
        <RenderField
          label="Buyer Mobile Number"
          required
          value={owd?.buyerPhoneNo}
          name="ownerDetails.buyerPhoneNo"
          type="Mobile"
        />
      </Section>
      </>
      )}


      <Section title="Expense Details">
        <RenderField
          label="PUC Charges"
          required
          value={exd?.pucCharges}
          name="expenseDetail.pucCharges"
        />
        <RenderField
          label="Insurance Charges"
          required
          value={exd?.insuranceCharges}
          name="expenseDetail.insuranceCharges"
        />
        <RenderField
          label="Other Charges"
          required
          value={exd?.otherCharges}
          name="expenseDetail.otherCharges"
        />
        {user?.role === "superadmin" &&
          <RenderField
            label="Admin Charges"
            value={exd?.adminCharges}
            name="expenseDetail.adminCharges"
          />}
      </Section>
    </form>
  <div ref={contentRef} className="print:block hidden text-sm leading-relaxed">
 <PrintableCaseDetails
    caseNo={caseNo}
    generalDetail={gd}
    vehicleDetail={vd}
    expireDetail={ed}
    transactionDetail={{
      ...td,
      hptFirmName: getFirmNameById(td?.hptId),
      hpaFirmName: getFirmNameById(td?.hpaId),
    }}
    ownerDetails={owd}
    expenseDetail={exd}
  />
</div>
    </>
  );
}
