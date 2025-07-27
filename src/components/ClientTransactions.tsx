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
            if(err?.status == '401' || err?.response?.status == '401')
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
                if(err?.status == '401' || err?.response?.status == '401')
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
        <div className={`mb-6 ${className}`}>
            <h2 className="text-lg font-bold mb-2 border-b pb-1">{title}</h2>
            <div className="grid grid-cols-2 gap-4">{children}</div>
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



    const PrintField = ({ label, value }: { label: string; value?: string | number | boolean }) => (
        <div className="mb-2">
            <span className="font-semibold">{label}:</span> {value || "-"}
        </div>
    );

    const PrintableCaseDetails = ({
        firstName,
        lastName,
        email,
        phoneNo,
        creditLimit,
        transactions = [],
    }: any) => {
        return (
            <div id="printable-content" className="p-12 text-sm leading-relaxed">
                {/* Letterhead */}
                <div className="mb-6 border-b pb-4">
                    <img src="/Group.svg" alt="Letterhead" className="mb-5 max-h-24" />
                    <p className="text-gray-600"></p>
                </div>

                {/* Client Info Section */}
                <Section2 title="Client Details">
                    <PrintField label="First Name" value={firstName} />
                    <PrintField label="Last Name" value={lastName} />
                    <PrintField label="Email" value={email} />
                    <PrintField label="Phone No." value={phoneNo} />
                    <PrintField label="Credit Limit" value={creditLimit} />
                </Section2>

                {/* Transaction Table */}
                {transactions.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-semibold mb-2">Transaction History</h2>
                        <table className="w-full text-left border border-collapse border-gray-300 text-xs">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-3 py-2">Date</th>
                                    <th className="border px-3 py-2">Remarks</th>
                                    <th className="border px-3 py-2">Mode</th>
                                    <th className="border px-3 py-2">Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.map((txn: any) => (
                                    <tr >
                                        <td className="border px-3 py-2">
                                            {new Date(txn.paymentDate).toLocaleDateString()}
                                        </td>
                                        <td className="border px-3 py-2 capitalize">{txn.remark}</td>
                                        <td className="border px-3 py-2">{txn.mode}</td>
                                        <td className="border px-3 py-2">₹{txn.Amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
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
            <div className="flex flex-col w-full">
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
            </SidebarProvider>
        </>
    );
};

export default Client;
