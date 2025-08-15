import { useState, useEffect } from "react";
import { useLoading } from "./LoadingContext";
import { getAllCases, rejectCase } from "@/service/case.service";
import { useLocation, useNavigate } from "react-router-dom";
import { Label } from "@radix-ui/react-label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getActiveClients } from "@/service/client.service";
import { Controller, useForm } from "react-hook-form";
import CaseDetails from "./CaseDetailsAdmin";
import { assignCase } from "@/service/case.service";
import { useToast } from "@/context/ToastContext";
import { DataTable } from "./DataTable";
import { caseTableColumns } from "@/lib/tables.data";
import { DateInput } from "./ui/date-input";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "./ui/textarea";


export interface CaseDetails {
  id: string;
  CaseNo: string;
  vehicleDetail: vehicleDetail;
  createdBy: createdBy;
  assignedTo?: AssignedTo;
  status: string;
  generalDetail: GeneralDetail;
}
export interface createdBy {
  firstName: string;
  lastName: string;
  employeeCode: string;
}

export interface AssignedTo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}
export interface vehicleDetail {
  vehicleNo: string;
}

export interface GeneralDetail {
  appointmentDate?: string;
}


function AssignDialog({ caseNo, caseId, disabled, clients, setFlag }: { caseNo: string, caseId: string, disabled?: boolean, clients: any[], setFlag: React.Dispatch<React.SetStateAction<boolean>> }) {
  const [open, setOpen] = useState(false);
  const { setLoading } = useLoading();
  // const [refreshFlag] = useState(false);
  const [search, setSearch] = useState("");
  const toast = useToast();

  const filteredClients = clients.filter((client) =>
    (`${client.firstName} ${client.lastname}`.toLowerCase().includes(search.toLowerCase()))
  );
  const { register, handleSubmit, setValue, watch, reset } = useForm<{ clientId: string }>({
    defaultValues: { clientId: "" },
  });

  const selectedClient = watch("clientId");
  const { logout } = useAuth();

  const onSubmit = (data: { clientId: string }) => {

    setLoading(true);
    assignCase(caseId, data.clientId).
      then(() => {
        // console.log(resp?.data);
        toast.showToast('Success', 'Case Assigned Successfully.', 'success');
      }).catch((err: any) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        else { toast.showToast('Error:', err?.response?.data?.errors[0] || 'Error Assigning Case', 'error'); }
      })
      .finally(() => {
        setLoading(false);
        setFlag(f => !f);
      });
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) reset(); }}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="ml-2"
          style={{ cursor: "pointer" }}
          disabled={disabled}
        >
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Case {caseNo} to Dealer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clients" className="font-bold">Dealers</Label>
            <hr />
            <Select
              onValueChange={(value) => { setValue("clientId", value); setSearch(''); }}
              value={selectedClient}
            >
              <SelectTrigger id="clients" className="w-full">
                <SelectValue placeholder="Select Dealer" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <div className="p-2">
                  <Input
                    placeholder="Search a Dealer"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-2"
                    onClick={(e) => e.stopPropagation()} // 👈 Prevent Select from closing
                    onKeyDown={(e) => e.stopPropagation()} // 👈 Prevent bubbling to Select
                  />
                </div>
                {filteredClients.map((client: any) => (
                  <SelectItem key={client.id} value={client?.users[0].id} className="w-full">
                    {client.firstName} {client.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Register the field for react-hook-form */}
            <input type="hidden" {...register("clientId", { required: true })} />
          </div>
          <DialogFooter>
            <Button style={{ cursor: "pointer" }} type="submit" disabled={!selectedClient}>Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AssignDialog2({
  caseNo,
  caseId,
  disabled,
  setFlag,
}: {
  caseNo: string;
  caseId: string;
  disabled?: boolean;
  setFlag: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [open, setOpen] = useState(false);
  const { setLoading } = useLoading();
  const toast = useToast();
  const { logout } = useAuth();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ reason: string }>({
    defaultValues: { reason: "" },
  });

  const onSubmit = async (data: { reason: string }) => {
    setLoading(true);
    try {
      await rejectCase(caseId, data.reason);
      toast.showToast("Success", "Case rejected successfully.", "success");
    } catch (err: any) {
      if (err?.status === 401 || err?.response?.status === 401) {
        toast.showToast("Error", "Session Expired", "error");
        logout();
      } else {
        toast.showToast("Error", err?.response?.data?.errors?.[0] || "Error rejecting case", "error");
      }
    } finally {
      setLoading(false);
      setFlag((f) => !f);
      setOpen(false);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) reset(); }}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="ml-2 cursor-pointer"
          disabled={disabled}
        >
          Reject
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reject Case {caseNo}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="font-bold">Reason for Rejection</Label>
            <Controller
              name="reason"
              control={control}
              rules={{ required: "Reason is required" }}
              render={({ field }) => (
                <Textarea
                  id="reason"
                  placeholder="Enter reason here..."
                  {...field}
                />
              )}
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{errors.reason.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export const CaseFilterType = {
  APPLICATION_DATE: "applicationDate",
  APPOINTMENT_DATE: "appointmentDate",
  PUC_EXPIRY: "pucExpiry",
  INSURANCE_EXPIRY: "insuranceExpiry",
  FITNESS_EXPIRY: "fitnessExpiry",
  TAX_EXPIRY: "taxExpiry",
  PERMIT_EXPIRY: "permitExpiry",
} as const;

export type CaseFilterType = typeof CaseFilterType;

export interface FilterFormValues {
  filterType: CaseFilterType[keyof CaseFilterType]; // "applicationDate" | "appointmentDate"
  fromDate: string;
  toDate: string;
}




// Inside your TableCell, after the FaEye button:
export default function CaseDes() {
  const navigate = useNavigate();
  const { setLoading } = useLoading();
  const toast = useToast();
  const [filteredCases, setFilteredCases] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [flag, setFlag] = useState(true);
  const { logout } = useAuth();

  const { handleSubmit, setValue, getValues, control, watch } = useForm<FilterFormValues>({
    defaultValues: {
      filterType: "applicationDate",
      fromDate: "",
      toDate: "",
    },
  });

  useEffect(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");


    const defaultFrom = `${yyyy}-${mm}-01`;
    const defaultTo = `${yyyy}-${mm}-${dd}`;

    setValue("fromDate", defaultFrom);
    setValue("toDate", defaultTo);
  }, [setValue]);


  useEffect(() => {
    setLoading(true);
    getActiveClients()
      .then((resp) => setClients(resp?.data || []))
      .catch((err) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        else {
          toast.showToast("Error:", err?.message || "Error fetching clients", "error");
        }
        setClients([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const location = useLocation();
  const selectedFilterType = watch("filterType");

  useEffect(() => {

    setLoading(true);
    const { state } = location;

    if (state?.type) {
      // Get last date of current month in `YYYY-MM-DD` format
      const now = new Date();
      const lastDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const lastDateOfMonth = `${lastDate.getFullYear()}-${String(lastDate.getMonth() + 1).padStart(2, "0")}-${String(lastDate.getDate()).padStart(2, "0")}`;


      switch (state.type) {
        case "PUC":
          setValue("filterType", "pucExpiry");
          setValue("toDate", lastDateOfMonth);
          break;
        case "INSURANCE":
          setValue("filterType", "insuranceExpiry");
          setValue("toDate", lastDateOfMonth);
          break;
        case "FITNESS":
          setValue("filterType", "fitnessExpiry");
          setValue("toDate", lastDateOfMonth);
          break;
        case "TAX":
          setValue("filterType", "taxExpiry");
          setValue("toDate", lastDateOfMonth);
          break;
        case "PERMIT":
          setValue("filterType", "permitExpiry");
          setValue("toDate", lastDateOfMonth);
          break;
        default:
          setValue("filterType", "applicationDate");
          break;
      }
    }

    const { fromDate, toDate, filterType } = getValues();
    if (!fromDate || !toDate) return;

    setLoading(true);
    getAllCases(filterType, fromDate, toDate)
      .then((resp) => {
        setFilteredCases(resp?.data || []);
      })
      .catch((err) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        else {
          toast.showToast('Error', err?.message || 'Error fetching Cases', 'error');
        }
      })
      .finally(() =>
        setLoading(false));
  }, [flag]);

  const applyFilter = async (data: FilterFormValues) => {
    const { fromDate, toDate, filterType } = data;

    if (!fromDate || !toDate) return;

    setLoading(true);
    try {
      const response = await getAllCases(filterType, fromDate, toDate);
      if (!response?.data || response.data.length === 0) {
        toast.showToast("Information", "No cases Available", "info");
      }
      setFilteredCases(response?.data || []);
    } catch (err: any) {
      if (err?.status == 401 || err?.response?.status == 401) {
        toast.showToast('Error', 'Session Expired', 'error');
        logout();
      }
      else {
        toast.showToast("Error", err?.message || "Failed to apply filter", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit(applyFilter)}
        className="flex flex-wrap gap-4 items-end md:flex-nowrap"
      >
        {/* Filter Type */}
        <div className="flex flex-col space-y-1 min-w-[150px] flex-1">
          <Label className="text-sm font-medium">
            Filter Type<span className="text-red-500">*</span>
          </Label>
          <Controller
            control={control}
            name="filterType"
            render={({ field }) => (
              <Select key={selectedFilterType} onValueChange={field.onChange} value={selectedFilterType}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select Filter" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CaseFilterType).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {key
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/(^|\s)\S/g, (l: string) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* From Date */}
        <div className="flex flex-col space-y-1 min-w-[150px] flex-1">
          <Label htmlFor="fromDate" className="text-sm font-medium capitalize">
            From Date<span className="text-red-500">*</span>
          </Label>
          <Controller
            name="fromDate"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DateInput
                id="fromDate"
                value={field.value}
                onChange={(e: any) => field.onChange(e.target.value)}
              />
            )}
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col space-y-1 min-w-[150px] flex-1">
          <Label htmlFor="toDate" className="text-sm font-medium capitalize">
            To Date<span className="text-red-500">*</span>
          </Label>
          <Controller
            name="toDate"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <DateInput
                id="toDate"
                value={field.value}
                onChange={(e: any) => field.onChange(e.target.value)}
              />
            )}
          />
        </div>

        <div className="w-full md:w-auto flex-1">
          <Button type="submit" style={{ cursor: "pointer" }} className="mt-2 w-full md:w-auto">
            Filter
          </Button>
        </div>
      </form>

      <DataTable
        data={filteredCases}
        columns={[
          ...caseTableColumns,
            {
            id:"Reference Name",
            header:"Reference Name",
            accessorFn: (row) => row?.referenceDetail?.name || "N/A",
            cell:(({row}) => {
              const reference = row.original?.referenceDetail;
              return reference ? reference.name : "N/A";
            }),
          },
            {
            id:"Reference Contact",
            header:"Reference Contact",
            accessorFn: (row) => row?.referenceDetail?.contactNo || "N/A",
            cell:(({row}) => {
              const reference = row.original?.referenceDetail;
              return reference ? reference.contactNo : "N/A";
            }),
          },
          {
            header: "Action",
            accessorKey: "action",
            cell: ({ row }: any) => {
              const caseData = row.original;
              return (
                <div className="flex">
                  <Button
                    variant="outline"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate(`/superadmin/cases/${caseData.CaseNo}`, {
                        state: { id: caseData.id, status: caseData.status },
                      })
                    }
                    title="View Details"
                    className="text-black hover:text-blue-600"
                  >
                    {/* <FaEye />
                     */}
                    View Details
                  </Button>
                  {caseData.status?.toLowerCase() === "ready" && (
                    <AssignDialog
                      caseNo={caseData.CaseNo}
                      caseId={caseData.id}
                      clients={clients}
                      setFlag={setFlag}
                    />
                  )}
                  {caseData.status?.toLowerCase() === "ready" && (
                    <AssignDialog2
                      caseNo={caseData.CaseNo}
                      caseId={caseData.id}
                      setFlag={setFlag}
                    />
                  )}
                </div>
              );
            },
          },                        

        ]}
      />
    </div>
  );
}



