import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { type FilterFormValues } from "./CaseDesAll";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "./LoadingContext";
import type { Employee } from "./EmployeeForm";
import { Label } from "./ui/label";
import { Controller, useForm } from "react-hook-form";
import { DateInput } from "./ui/date-input";
import { getCasesbyEmployee } from "@/service/case.service";

// Dummy types – replace with actual types
type CaseItem = {
    id: string;
    CaseNo: string;
    status: string;
    createdAt: string;
    vehicleDetail?: {
        vehicleNo?: string;
    };
    generalDetail: generalDetail;
};


type generalDetail = {
    applicationNo: string;
    appointmentDate: string;
    incentiveAmount: string;
}

export default function ClientDetails() {
    const { state } = useLocation();
    const navigate = useNavigate();
     const employee: Employee | undefined = state?.employee;
    const toast = useToast();
    const [cases, setCases] = useState<CaseItem[]>([]);
    const { setLoading } = useLoading();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [open, setOpen] = useState(false);
    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
    };

    const { handleSubmit, setValue, control } = useForm<FilterFormValues>({
        defaultValues: {
            filterType: "applicationDate",
            fromDate: "",
            toDate: "",
        },
    });


    const applyFilter = async (data: FilterFormValues) => {
        const { fromDate, toDate, filterType } = data;

        if (!fromDate || !toDate) return;

        setLoading(true);
        try {
            const response = await getCasesbyEmployee(filterType, fromDate, toDate, employee?.id ?? "");
           setCases(Array.isArray(response?.data?.cases) ? response.data.cases : []);
        } catch (err) {
            console.error("Error fetching filtered cases:", err);
            toast.showToast("Error", "Failed to apply filter", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");

        const defaultFrom = `${yyyy}-${mm}-01`;
        const defaultTo = `${yyyy}-${mm}-${dd}`;

        setValue("fromDate", defaultFrom);
        setValue("toDate", defaultTo);

        if (employee?.id) {
            setLoading(true);
            getCasesbyEmployee("applicationDate", defaultFrom, defaultTo, employee.id)
                .then((response) => {
                    setCases(Array.isArray(response?.data?.cases) ? response.data.cases : []);
                })
                .catch((err) => {
                    console.error("Error fetching employee cases:", err);
                    toast.showToast("Error", "Failed to fetch cases", "error");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [setValue]);


    const toggleCard = (idx: number) => {
        setExpandedIndex((prev) => (prev === idx ? null : idx));
    };

      if (!employee) {
    return (
      <div className="p-6">
        <p className="text-center text-red-500 font-semibold">No employee data found.</p>
      </div>
    );
  }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <div className="flex flex-col w-full bg-white pr-6 py-4 h-full min-h-[100vh]">
                <div className="flex justify-end mb-4">
                    <Button
                        style={{ cursor: "pointer" }}
                        variant="default"
                        className="sticky cursor-pointer z-50 mr-5 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </Button>
                    <Button style={{ cursor: "pointer" }} variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={() => setOpen(true)}>
                        Logout
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Logout</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to logout?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2">
                                <Button style={{ cursor: "pointer" }} variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button style={{ cursor: "pointer" }} variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                <div className="flex flex-col w-full h-full min-h-screen overflow-y-auto p-6 space-y-6">
                    {/* Top Client Info Card */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-bold">
                                {employee.firstName} {employee.lastName}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {employee.email} | {employee.phoneNo}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {employee.branchCode} {employee.employeeCode}, {employee.role}
                            </p>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">


                        </CardContent>
                    </Card>

                    {/* Case Cards */}
                    <form
                        onSubmit={handleSubmit(applyFilter)}
                        className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-end w-full"
                    >
                        {/* Filter Type */}
                        <div className="flex flex-col space-y-1 w-full sm:w-auto">
                            <Label className="text-sm font-medium">
                                Filter Type<span className="text-red-500">*</span>
                            </Label>
                            <Controller
                                control={control}
                                name="filterType"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger className="w-full sm:w-[200px]">
                                            <SelectValue placeholder="Select Filter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries({
                                                APPLICATION_DATE: "applicationDate",
                                                APPOINTMENT_DATE: "appointmentDate",
                                            }).map(([key, value]: [string, string]) => (
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
                        <div className="flex flex-col space-y-1 w-full sm:w-auto">
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
                                        className="w-full"
                                    />
                                )}
                            />
                        </div>

                        {/* To Date */}
                        <div className="flex flex-col space-y-1 w-full sm:w-auto">
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
                                        className="w-full"
                                    />
                                )}
                            />
                        </div>

                        <div className="w-full sm:w-auto flex items-end">
                            <Button type="submit" className="w-full sm:w-auto mt-2 sm:mt-0">
                                Filter
                            </Button>
                        </div>
                    </form>


                    {cases.length === 0 ? (
                        <p className="text-muted-foreground text-center">No cases found for this client.</p>
                    ) : (
                        cases.map((item, idx) => {
                            const isOpen = expandedIndex === idx;
                            const { id, CaseNo, status, createdAt, vehicleDetail, generalDetail } = item;
                            const IncentiveAmount = generalDetail?.incentiveAmount ?? "0";
                            const caseData = { id, CaseNo, status, createdAt, vehicleDetail, generalDetail };

                            return (
                                <Card key={id} className="border shadow-md">
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
                                                <RenderField
                                                    label="Vehicle No"
                                                    value={caseData.vehicleDetail?.vehicleNo ?? "N/A"}
                                                />
                                                <RenderField
                                                    label="Created On"
                                                    value={new Date(caseData.createdAt).toLocaleDateString()}
                                                />

                                                <RenderField
                                                    label="Application No"
                                                    value={caseData.generalDetail.applicationNo}
                                                />
                                                <RenderField
                                                    label="Appointment Date"
                                                    value={new Date(caseData.generalDetail.appointmentDate).toLocaleDateString()}
                                                />
                                                <RenderField
                                                    label="Incentive Amount"
                                                    value={`₹${(+IncentiveAmount).toFixed(2)}/-`}
                                                />
                                                <RenderField label="Status" value={caseData.status} />

                                            </div>
                                            <div className="flex justify-end">
                                                <Button
                                                    onClick={() =>
                                                        navigate(`/superadmin/cases/${caseData.CaseNo}`, {
                                                            state: { id: caseData.id },
                                                        })
                                                    }
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
                        })
                    )}
                </div>
            </div>
        </SidebarProvider>
    );
}

// Reusable field renderer
function RenderField({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <p className="text-muted-foreground text-xs">{label}</p>
            <p className="font-medium">{value || "—"}</p>
        </div>
    );
}
