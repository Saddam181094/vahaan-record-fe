import { useState, useEffect } from "react";
import { useLoading } from "./LoadingContext";
import { getAllRejectedCases} from "@/service/case.service";
import { useLocation, useNavigate } from "react-router-dom";
import { Label } from "@radix-ui/react-label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Controller, useForm } from "react-hook-form";
import CaseDetails from "./CaseDetailsAdmin";
import { useToast } from "@/context/ToastContext";
import { DataTable } from "./DataTable";
import { caseTableColumns } from "@/lib/tables.data";
import { DateInput } from "./ui/date-input";
import { useAuth } from "@/context/AuthContext";
import { SidebarProvider, SidebarTrigger } from "./ui/sidebar";
import { AppSidebar } from "./app-sidebar";


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

export const CaseFilterType = {
  APPLICATION_DATE: "applicationDate",
  APPOINTMENT_DATE: "appointmentDate",
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
  const [rejectedCases, setRejectedCases] = useState<any[]>([]);
//   const [clients, setClients] = useState<any[]>([]);
  // const [flag, setFlag] = useState(true);
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
        default:
          setValue("filterType", "applicationDate");
          setValue("toDate", lastDateOfMonth);
          break;
      }
    }

    const { fromDate, toDate, filterType } = getValues();
    if (!fromDate || !toDate) return;

    setLoading(true);
    getAllRejectedCases(filterType, fromDate, toDate)
      .then((resp) => {
        setRejectedCases(resp?.data || []);
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
      .finally(() =>{
        setLoading(false)
      }
        );
  }, []);

  const applyFilter = async (data: FilterFormValues) => {
    const { fromDate, toDate, filterType } = data;

    if (!fromDate || !toDate) return;

    setLoading(true);
    try {
      const response = await getAllRejectedCases(filterType, fromDate, toDate);
      if (!response?.data || response.data.length === 0) {
        toast.showToast("Information", "No cases Available", "info");
      }
      setRejectedCases(response?.data || []);
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
        <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh]">
          <div className="flex flex-col w-full h-full min-h-screen ml-3">
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
        data={rejectedCases}
        columns={[
          ...caseTableColumns,
            {
            id:"Reference",
            header:"Reference",
            cell:(({row}) => {
              const reference = row.original?.referenceDetail;
          
              return (
                <div className="flex flex-col text-sm">
                {reference.name}
                <br/>
                <span className="text-gray-600 text-xs">{reference.contactNo}</span>
                </div>
               )
            })
          },
          {
            id: "remarks",
            header: "Remarks",
            cell: ({ row }) => {
              const remarks = row.original?.rejectionRemarks || "No remarks";
              return <span>{remarks.replace(/_/g, " ")}</span>;
            },
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
                    View Details
                  </Button>
                  {/* {caseData.status?.toLowerCase() === "ready" && (
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
                  )} */}
                </div>
              );
            },
          },

        ]}
      />
      
    </div>
          </div>
        </div>
      </SidebarProvider>
    </>

  );
}



