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
import { TransactionTo } from "@/components/CaseForm";
import { Input } from "./ui/input";
import React from "react";

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
  // const [searchRTOfrom, setSearchRTOfrom] = useState("");
  const {logout} = useAuth();


  const filteredfirms = firms.filter(f => f.name.toLowerCase().includes((searchHPA || searchHPT).toLowerCase()));
  // const filteredCode1 = RTOOptions.filter(f => f.label.toLowerCase().includes((searchRTOfrom).toLowerCase()));

  const filteredHPTFirms = React.useMemo(() => (
    (filteredfirms ?? []).filter(f => f.name.toLowerCase().includes(searchHPT.toLowerCase()))
  ), [filteredfirms, searchHPT]);
  const filteredHPAFirms = React.useMemo(() => (
    (filteredfirms ?? []).filter(f => f.name.toLowerCase().includes(searchHPA.toLowerCase()))
  ), [filteredfirms, searchHPA]);

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
        if(err?.status == 401 || err?.response?.status == 401)
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
//       if (err?.status == 401 || err?.response?.status == 401) {
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
          if(err?.status == 401 || err?.response?.status == 401)
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
        if(err?.status == 401 || err?.response?.status == 401)
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
      if(err?.status == 401 || err?.response?.status == 401)
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
    generalDetail:{
      ...data.generalDetail,
      appointmentDate:formatDate(data.generalDetail.appointmentDate)??""
    },
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
  <div className={`mb-8 ${className}`}>
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-t-lg shadow-sm">
      <h3 className="text-lg font-bold">{title}</h3>
    </div>
    <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm p-6">
      <div className="space-y-1">
        {children}
      </div>
    </div>
  </div>
);


  const PrintField = ({ label, value }: { label: string; value?: string | number | boolean }) => {
    const isBoolean = typeof value === 'boolean' || value === 'Yes' || value === 'No';
    const isYes = value === true || value === 'Yes';
    
    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-100">
        <span className="font-medium text-gray-700 min-w-[140px]">{label}</span>
        <span className={`font-semibold text-right flex-1 ${
          isBoolean 
            ? isYes 
              ? 'text-green-600 bg-green-50 px-2 py-1 rounded' 
              : 'text-red-600 bg-red-50 px-2 py-1 rounded'
            : 'text-gray-900'
        }`}>
          {value || "-"}
        </span>
      </div>
    );
  };

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
                      <Input
                        placeholder="Search..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-2 py-1 text-sm border rounded"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
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
                   onChange={(e) => {
          const value = e.target.value.toUpperCase();  // Convert to uppercase
          field.onChange(value);
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

    //   useEffect(() => {
    //   // Listen to all input events, force uppercase
    //   const handler = (e:any) => {
    //     if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) {
    //       e.target.value = e.target.value.toUpperCase();
    //     }
    //   };
    //   document.addEventListener('input', handler, true);
    //   return () => document.removeEventListener('input', handler, true);
    // }, []);


    return (
      <div 
        id="printable-content" 
        className="p-8 text-sm leading-relaxed bg-gray-50 min-h-screen print-content"
      >
        {/* Letterhead */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <img
                src="/Group.svg"
                alt="Letterhead"
                className="h-16 w-auto pr-5"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800">Case Details Report</h1>
                <p className="text-gray-600 text-sm">Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">Case No</p>
                <p className="text-xl font-bold">#{caseNo}</p>
              </div>
            </div>
          </div>
        </div>
        {/* <p>{{name}}</p> */}

        <Section2 title="General Details" className="pt-8">
          <PrintField label="Firm Name" value={generalDetail?.firmName} />
          <PrintField label="Appointment Date" value={formatDate(generalDetail?.appointmentDate)} />
          <PrintField label="Application No." value={generalDetail?.applicationNo} />
          <PrintField label="Incentive Amount" value={generalDetail?.incentiveAmount} />
        </Section2>

        <Section2 title="Vehicle Details" className="pt-8">
          <PrintField label="Vehicle No" value={vehicleDetail?.vehicleNo} />
          <PrintField label="From RTO" value={vehicleDetail?.fromRTO} />
          <PrintField label="To RTO" value={vehicleDetail?.toRTO} />
          <PrintField label="Chassis No" value={vehicleDetail?.chassisNo} />
          <PrintField label="Engine No" value={vehicleDetail?.engineNo} />
          <PrintField label="RMA Vehicle No" value={vehicleDetail?.rmaVehicleNo} />
        </Section2>

        <Section2 title="Expire Details" className="pt-8 break-before-page">
          <PrintField label="Insurance Expiry" value={formatDate(expireDetail?.insuranceExpiry)} />
          <PrintField label="PUC Expiry" value={formatDate(expireDetail?.pucExpiry)} />
          <PrintField label="Fitness Expiry" value={formatDate(expireDetail?.fitnessExpiry)} />
          <PrintField label="Tax Expiry" value={formatDate(expireDetail?.taxExpiry)} />
          <PrintField label="Permit Expiry" value={formatDate(expireDetail?.permitExpiry)} />
        </Section2>

        <Section2 title="Transaction Details" className="pt-20">
          <PrintField label="To RTO" value={transactionDetail?.to} />
          <PrintField label="HPT Firm" value={transactionDetail?.hptFirmName} />
          <PrintField label="HPA Firm" value={transactionDetail?.hpaFirmName} />
          <PrintField label="Number Plate" value={transactionDetail?.numberPlate} />
          <PrintField label="Remarks" value={transactionDetail?.remarks} />
          
          <div className="col-span-full mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-3">Transaction Services</h4>
            <div className="grid grid-cols-2 gap-4">
              <PrintField label="Fitness" value={getBool(transactionDetail?.fitness)} />
              <PrintField label="RRF" value={getBool(transactionDetail?.rrf)} />
              <PrintField label="RMA" value={getBool(transactionDetail?.rma)} />
              <PrintField label="Alteration" value={getBool(transactionDetail?.alteration)} />
              <PrintField label="Conversion" value={getBool(transactionDetail?.conversion)} />
              <PrintField label="Address Change" value={getBool(transactionDetail?.addressChange)} />
              <PrintField label="DRC" value={getBool(transactionDetail?.drc)} />
            </div>
          </div>
        </Section2>

{owd && (
        <Section2 title="Ownership Transfer Details" className="pt-8 break-before-page">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                Seller Information
              </h4>
              <PrintField label="Seller Name" value={ownerDetails?.sellerName} />
              <PrintField label="Seller Aadhar" value={ownerDetails?.sellerAadharNo} />
              <PrintField label="Seller Address" value={ownerDetails?.sellerAddress} />
              <PrintField label="Seller State" value={ownerDetails?.sellerState} />
              <PrintField label="Seller Phone" value={ownerDetails?.sellerPhoneNo} />
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                Buyer Information
              </h4>
              <PrintField label="Buyer Name" value={ownerDetails?.buyerName} />
              <PrintField label="Buyer Aadhar" value={ownerDetails?.buyerAadharNo} />
              <PrintField label="Buyer Address" value={ownerDetails?.buyerAddress} />
              <PrintField label="Buyer State" value={ownerDetails?.buyerState} />
              <PrintField label="Buyer Phone" value={ownerDetails?.buyerPhoneNo} />
            </div>
          </div>
        </Section2>
)}
        <Section2 title="Expense Details" className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="font-semibold text-xl text-gray-700 mb-3">Service Charges</span>
              <PrintField label="PUC Charges" value={expenseDetail?.pucCharges ? `₹${expenseDetail.pucCharges}` : "Not Alloted"} />
              <PrintField label="Insurance Charges" value={expenseDetail?.insuranceCharges ?`₹${expenseDetail.insuranceCharges}` : "Not Alloted"} />
              <PrintField label="Receipt Amount" value={expenseDetail?.receiptAmount ? `₹${expenseDetail.receiptAmount}` : "Not Alloted"} />
            </div>
            {user?.role === 'superadmin' && (
              <div>
                <span className="font-semibold text-xl text-gray-700 mb-3">Additional Charges</span>
                <PrintField label="Other Charges" value={expenseDetail?.otherCharges ? `₹${expenseDetail.otherCharges}` : "Not Alloted"} />
                <PrintField label="Admin Charges" value={expenseDetail?.adminCharges ? `₹${expenseDetail.adminCharges}` : "Not Alloted"} />
              </div>
            )}
          </div>
        </Section2>
        
        {/* Summary Section */}
        {/* <div className="bg-white rounded-lg shadow-lg p-6 mt-8 border border-gray-200 pt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Case Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-800">Vehicle Information</p>
              <p className="text-blue-600 font-semibold">{vehicleDetail?.vehicleNo || 'N/A'}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-medium text-green-800">Firm</p>
              <p className="text-green-600 font-semibold">{generalDetail?.firmName || 'N/A'}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="font-medium text-purple-800">Total Charges</p>
              <p className="text-purple-600 font-semibold">
                ₹{(expenseDetail?.pucCharges || 0) + (expenseDetail?.insuranceCharges || 0) + (expenseDetail?.receiptAmount || 0)}
              </p>
            </div>
          </div>
        </div> */}
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
    <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6 no-print print:hidden">
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
  {(status?.toLowerCase() === "assigned" || status?.toLowerCase() === "paid" || status?.toLowerCase() === "closed")? null : (
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
          options={Object.values(TransactionTo)}
          name="transactionDetail.to"
        />
        <RenderField
          label="HPT ID"
          required
          value={editMode ? td?.hptId ?? "" : getFirmNameById(td?.hptId)}
          name="transactionDetail.hptId"
          options={filteredHPTFirms}
          search={searchHPT}
          setSearch={setSearchHPT}
          getOptionValue={opt => opt.id}
          getOptionLabel={opt => opt.name}
        />
        <RenderField
          label="HPA ID"
          required
          value={editMode ? td?.hpaId ?? "" : getFirmNameById(td?.hpaId)}
          name="transactionDetail.hpaId"
          options={filteredHPAFirms}
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
          label="Reciept Amount"
          required
          value={exd?.receiptAmount}
          name="expenseDetail.receiptAmount"
        />
        {user?.role === "superadmin" &&(
          <>
          <RenderField
            label="Admin Charges"
            value={exd?.adminCharges}
            name="expenseDetail.adminCharges"
          />
          
        <RenderField
          label="Other Charges"
          value={exd?.otherCharges}
          name="expenseDetail.otherCharges"
        />
        </>)}
      </Section>
    </form>
  <div ref={contentRef} className="print:block hidden text-sm leading-relaxed printable-section">
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
