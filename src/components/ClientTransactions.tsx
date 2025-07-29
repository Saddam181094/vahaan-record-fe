import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
// import UClient from "@/components/UClient";
import { useEffect, useState } from "react";
import { DataTable } from "./DataTable";
import { Label } from "./ui/label";
import { Controller, useForm } from "react-hook-form";
import { DateInput } from "./ui/date-input";
import type { FilterFormValues } from "./CaseDesAll";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "./LoadingContext";
import { clientTransaction } from "@/service/client.service";
import { clientTransactioncolumns } from "@/lib/tables.data";
// import { useReactToPrint } from "react-to-print";
import printJS from 'print-js';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

const Client = () => {
    const toast = useToast();
    const [filteredCases, setFilteredCases] = useState<any>();
    const { setLoading } = useLoading();
    const { user,logout } = useAuth();
    const [isDisabled, setisDisabled] = useState(true);
    const { handleSubmit, control, setValue } = useForm<FilterFormValues>({
        defaultValues: {
            filterType: "applicationDate",
            fromDate: "",
            toDate: "",
        },
    });

    const applyFilter = async (data: FilterFormValues) => {
        const { fromDate, toDate } = data;

        if (!fromDate || !toDate) return;

        setLoading(true);
        try {
            const response = await clientTransaction(fromDate, toDate, user?.id ?? "");
            setFilteredCases(response?.data || []);
            setisDisabled(response?.data?.transactions?.length > 0);
        } catch (err:any) {
            if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
            //   console.error("Error fetching filtered cases:", err);
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


        if (!defaultFrom || !defaultTo) return;

        setLoading(true);
        clientTransaction(defaultFrom, defaultTo, user?.id ?? "").then((response) => {
            setFilteredCases(response?.data || []);
            setLoading(false);

            if (response?.data?.transactions?.length > 0) {
                setisDisabled(true);
            } else {
                setisDisabled(false);
            }
        }).
            catch((err: any) => {
                if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
                //   console.error("Error fetching filtered cases:", err);
                toast.showToast("Error", err?.message, "error");
            }).finally(() => {
                setLoading(false);
            })

    },
        [setValue]);

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


const handlePrint = () => {
  printJS({
    printable: 'printable-content',
    type: 'html',
    targetStyles: ['*'], // apply all styles
  });
};

//     const contentRef = useRef<HTMLDivElement>(null);
//    const reactToPrintFn = useReactToPrint({
//   contentRef,
//   documentTitle: "Client Report",
//   pageStyle: `
//     @media print {
//       body * {
//         visibility: hidden;
//       }
//       #printable-content, #printable-content * {
//         visibility: visible;
//       }
//       #printable-content {
//         position: absolute;
//         left: 0;
//         top: 0;
//         width: 100%;
//       }
//     }
//   `
// });



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

    const PrintableCaseDetails = ({
        firstName,
        lastName,
        email,
        phoneNo,
        creditLimit,
        transactions = [],
    }: any) => {
        return (
            <div id="printable-content" className="p-8 text-sm leading-relaxed bg-gray-50 min-h-screen print-content">
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
                                <h1 className="text-xl font-bold text-gray-800">Client Transaction Report</h1>
                                <p className="text-gray-600 text-sm">Generated on {new Date().toLocaleDateString()}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                                <p className="text-sm font-medium">Client ID</p>
                                <p className="text-xl font-bold">#{firstName?.slice(0, 3).toUpperCase()}{lastName?.slice(0, 3).toUpperCase()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Client Information */}
                <Section2 title="Client Information">
                    <PrintField label="First Name" value={firstName} />
                    <PrintField label="Last Name" value={lastName} />
                    <PrintField label="Email" value={email} />
                    <PrintField label="Phone No." value={phoneNo} />
                    <PrintField label="Credit Limit" value={creditLimit ? `₹${creditLimit}` : "Not Set"} />
                </Section2>

                {/* Transaction History */}
                {transactions.length > 0 && (
                    <Section2 title="Transaction History">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-xs">
                                <thead className="bg-gray-100 text-gray-800 uppercase tracking-wide">
                                    <tr>
                                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Date</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Remarks</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Mode</th>
                                        <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {transactions.map((txn: any, index: number) => (
                                        <tr key={index} className="even:bg-gray-50 odd:bg-white">
                                            <td className="border border-gray-300 px-4 py-2">
                                                {new Date(txn.paymentDate).toLocaleDateString()}
                                            </td>
                                            <td className="border border-gray-300 px-4 py-2 capitalize">{txn.remark}</td>
                                            <td className="border border-gray-300 px-4 py-2">{txn.mode}</td>
                                            <td className="border border-gray-300 px-4 py-2 font-semibold">₹{txn.Amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Section2>
                )}

                {/* Summary Section */}
                <div className="bg-white rounded-lg shadow-lg p-6 mt-8 border border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                        <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                        Transaction Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-blue-50 p-3 rounded-lg">
                            <p className="font-medium text-blue-800">Total Transactions</p>
                            <p className="text-blue-600 font-semibold">{transactions.length}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                            <p className="font-medium text-green-800">Total Amount</p>
                            <p className="text-green-600 font-semibold">
                                ₹{transactions.reduce((sum: number, txn: any) => sum + (parseFloat(txn.Amount) || 0), 0).toFixed(2)}
                            </p>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                            <p className="font-medium text-purple-800">Credit Limit</p>
                            <p className="text-purple-600 font-semibold">{creditLimit ? `₹${creditLimit}` : 'Not Set'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);



    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <SidebarTrigger />
            <div className="flex flex-col w-full print:hidden">
                <div className="flex flex-col w-full bg-white lg:pr-6 px-2 lg:pt-20 h-full min-h-[100vh] print:hidden">

                    {/* Extract clientDetails from the first transaction if available */}
                    <Button type="button" disabled={!isDisabled} style={{ cursor: isDisabled ? "pointer" : "not-allowed" }} onClick={handlePrint} className="w-fit bg-primary text-white mb-5">
                        🖨️ Print PDF
                    </Button>
                    <form
                        onSubmit={handleSubmit(applyFilter)}
                        className="flex flex-wrap gap-4 items-end md:flex-nowrap"
                    >
                        {/* From Date */}
                        <div className="flex flex-col space-y-1 flex-1 min-w-[140px]">
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
                        <div className="flex flex-col space-y-1 flex-1 min-w-[140px]">
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

                        <Button type="submit" style={{ cursor: "pointer" }} className="mt-2 w-full md:w-auto">
                            Filter
                        </Button>
                    </form>
                    <DataTable
                        data={filteredCases?.transactions ?? []}
                        columns={[...clientTransactioncolumns,
                        {
                            header: "Actions",
                            id: "actions",
                            cell: ({ row }) => (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setSelectedTransaction(row.original); // Set modal data
                                        setShowModal(true); // Open modal
                                    }}
                                >
                                    View Details
                                </Button>
                            ),
                        }


                        ]
                        }
                    />
                </div>
                {showModal && selectedTransaction && (
                    <Dialog open={showModal} onOpenChange={setShowModal}>
                        <DialogContent >
                            <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                                <DialogDescription>
                                    Below are the linked case details for this transaction.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-4 space-y-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Case No</TableHead>
                                            <TableHead>Vehicle No</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedTransaction.cases?.map((c: any) => (
                                            <TableRow key={c.id}>
                                                <TableCell>{c.caseNo}</TableCell>
                                                <TableCell>{c.vehicleNo}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}


                         <footer className="w-full mt-70 py-4 bg-gray-100 border-t text-center text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <span>
                  <strong>Customer Care:</strong> 7801878800
                </span>
                <span className="hidden md:inline mx-2">|</span>
                <span>
                  <strong>Mail:</strong> info@vahaanrecord.com
                </span>
                <span className="hidden md:inline mx-2">|</span>
                <span>
                  Contact us For any Query or help
                </span>
                        </footer>

            </div>
                <div className="print:block hidden text-sm leading-relaxed">
                    <PrintableCaseDetails
                        firstName={filteredCases?.clientDetails?.firstName}
                        lastName={filteredCases?.clientDetails?.lastName}
                        email={filteredCases?.clientDetails?.email}
                        phoneNo={filteredCases?.clientDetails?.phoneNo}
                        creditLimit={filteredCases?.clientDetails?.client?.creditLimit}
                        transactions={filteredCases?.transactions || []}
                    />
                </div>
            </SidebarProvider>
        </>
    );
};

export default Client;
