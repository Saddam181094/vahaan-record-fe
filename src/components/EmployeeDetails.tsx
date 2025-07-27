import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { type FilterFormValues } from "./CaseDesAll";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Card,
    CardHeader,
    CardContent,
} from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "./LoadingContext";
import type { Employee } from "./EmployeeForm";
import { Label } from "./ui/label";
import { Controller, useForm } from "react-hook-form";
import { DateInput } from "./ui/date-input";
import { getCasesbyEmployee } from "@/service/case.service";
import { useAuth } from "@/context/AuthContext";
import printJS from "print-js";

// Dummy types – replace with actual types
type CaseItem = {
    id: string;
    CaseNo: string;
    status: string;
    createdAt: string;
    incentiveStatus: string;
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
    const { logout } = useAuth();
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const [incentiveDialogOpen, setIncentiveDialogOpen] = useState(false);
    const [isDisabled, setisDisabled] = useState(true);


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

            setisDisabled(response?.data?.cases?.length === 0);
        } catch (err: any) {
            if (err?.status == '401' || err?.response?.status == '401') {
                toast.showToast('Error', 'Session Expired', 'error');
                logout();
            }
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
                    if (err?.status == '401' || err?.response?.status == '401') {
                        toast.showToast('Error', 'Session Expired', 'error');
                        logout();
                    }
                    toast.showToast("Error", "Failed to fetch cases", "error");
                })
                .finally(() => {
                    setLoading(false);
                });
        }
    }, [setValue]);

    const handlePrint = () => {
        printJS({
            printable: 'printable-content',
            type: 'html',
            targetStyles: ['*'], // apply all styles
        });
    };

    const PrintableIncentiveDetails = ({ cases = [] }: { cases: any[] }) => {
        const totalIncentive = cases.reduce(
            (sum, c) => sum + Number(c.generalDetail?.incentiveAmount || 0),
            0
        );

        return (
            <div id="printable-content" className="p-12 text-sm leading-relaxed font-sans text-gray-800">
                {/* === Letterhead === */}
                <div className="mb-6 border-b border-gray-300 pb-4 flex items-center justify-between">
                    <img src="/Group.svg" alt="Letterhead Logo" className="h-16" />
                </div>

                {/* === Incentive Header === */}
                <div className="mb-8">
                    <h1 className="text-4xl font-semibold mb-4 border-b pb-1 border-gray-200">Incentive Details</h1>
                    <p className="text-gray-600 mb-2">Summary of incentives for the selected period.</p>
                </div>

                {/* === Incentive Table === */}
                {cases.length > 0 ? (
                    <div>
                        <table className="w-full border-collapse text-xs shadow-sm rounded-md overflow-hidden">
                            <thead className="bg-gray-200 text-gray-800 uppercase tracking-wide">
                                <tr>
                                    <th className="border-l-4 border-blue-500 px-4 py-2 text-left">Case No</th>
                                    <th className="border-l-4 border-blue-500 px-4 py-2 text-left">Vehicle No</th>
                                    <th className="border-l-4 border-blue-500 px-4 py-2 text-left">Incentive Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {cases.map((c, idx) => (
                                    <tr key={idx} className="even:bg-gray-100 odd:bg-white">
                                        <td className="border border-gray-300 px-4 py-2">{c.CaseNo}</td>
                                        <td className="border border-gray-300 px-4 py-2">{c.vehicleDetail?.vehicleNo || "-"}</td>
                                        <td className="border border-gray-300 px-4 py-2">₹{Number(c.generalDetail?.incentiveAmount || 0).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="text-right font-semibold text-base mt-6">
                            Total Incentive: ₹{totalIncentive.toFixed(2)}
                        </div>
                    </div>
                ) : (
                    <div className="text-center text-gray-500 mt-6">No incentive records available.</div>
                )}
            </div>
        );
    };


    const toggleCard = (idx: number) => {
        setExpandedIndex((prev) => (prev === idx ? null : idx));
    };

    const handleClick = () => () => {
        if (cases.length === 0) {
            toast.showToast("Notice", "No cases to calculate incentives.", "info");
            return;
        }
        setIncentiveDialogOpen(true);
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
            <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh]">
                <div className="flex justify-end mb-4">
                    <Button
                        style={{ cursor: "pointer" }}
                        variant="default"
                        className="sticky cursor-pointer z-50 mr-5 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
                        onClick={() => navigate(-1)}
                    >
                        ← Back
                    </Button>
                </div>
                <div className="flex flex-col w-full h-full min-h-screen overflow-y-auto p-6 space-y-6">
                    {/* Top Client Info Card */}
                    <Card>
                        <CardHeader>
                            <div className="flex gap-4 flex-1 md:items-center">
                                <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 md:text-4xl text-2xl font-bold">
                                    {employee?.firstName?.[0] ?? ''}{employee?.lastName?.[0] ?? ''}
                                </div>
                                <div className="space-y-1">
                                    <p><strong>Name:</strong> {employee?.firstName} {employee?.lastName}</p>
                                    <p><strong>Email:</strong> {employee?.email}</p>
                                    <p className="text-sm text-muted-foreground">
                                        Branch Code : {employee.branchCode}, Employee Code : {employee.employeeCode}
                                    </p>
                                </div>
                            </div>

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
                            <Button type="submit" style={{ cursor: "pointer" }} className="w-full sm:w-auto mt-2 sm:mt-0">
                                Filter
                            </Button>
                        </div>

                        <div className="w-full sm:w-auto flex items-end">
                            <Button type="button" style={{ cursor: "pointer" }} className="w-full sm:w-auto mt-2 sm:mt-0" onClick={handleClick()}>
                                Calculate Incentive
                            </Button>
                        </div>
                    </form>


                    {cases.length === 0 ? (
                        <p className="text-muted-foreground text-center">No cases found for this Employee.</p>
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
                                                    style={{ cursor: "pointer" }}
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
            <Dialog open={incentiveDialogOpen} onOpenChange={setIncentiveDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Incentive Details</DialogTitle>
                        <DialogDescription>Summary of incentives for the selected period.</DialogDescription>
                    </DialogHeader>

                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Case No</TableHead>
                                <TableHead>Vehicle No</TableHead>
                                <TableHead>Incentive Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {cases.map((c, idx) => (
                                <TableRow key={idx}>
                                    <TableCell>{c.CaseNo}</TableCell>
                                    <TableCell>{c.vehicleDetail?.vehicleNo || "-"}</TableCell>
                                    <TableCell>
                                        ₹{Number(c.generalDetail?.incentiveAmount || 0).toFixed(2)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <div className="text-right font-semibold text-lg mt-4">
                        Total Incentive: ₹
                        {cases
                            .reduce((sum, c) => sum + Number(c.generalDetail?.incentiveAmount || 0), 0)
                            .toFixed(2)}
                    </div>

                    <Button type="button" disabled={!isDisabled} style={{ cursor: isDisabled ? "pointer" : "not-allowed" }} onClick={handlePrint} className="w-full sm:w-auto mt-2 sm:mt-0">
                        🖨️ Print Incentive PDF
                    </Button>
                </DialogContent>
            </Dialog>

            <div className="print:block hidden text-sm leading-relaxed">
                <PrintableIncentiveDetails cases={cases} />
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


