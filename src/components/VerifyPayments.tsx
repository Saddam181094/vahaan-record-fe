import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { useToast } from "@/context/ToastContext";
// import { useNavigate } from "react-router-dom";
import { useLoading } from "./LoadingContext";
import { getUnPayments } from "@/service/case.service";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";

type PaymentBy = {
    id: string;
    name: string;
    email: string;
    phoneNo: string;
};

type CaseAssignment = {
    id: string;
    TotalAmount: number;
    case: {
        caseNo: string;
        vehicleDetail: {
            vehicleNo: string;
        };
    };
};

type PaymentData = {
    id: string;
    paymentBy: PaymentBy;
    Mode: string;
    PaymentDate: string;
    PaymentProofUrl: string;
    Remarks: string;
    caseAssignments: CaseAssignment[];
};

const paymentTableColumns = (
  openProofDialog: (url: string) => void,
  onVerify: (id: string) => void,
  onReject: (id: string) => void
): ColumnDef<PaymentData>[] => [
  {
    accessorKey: "id",
    header: "Payment ID",
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
  },
  {
    accessorKey: "paymentBy",
    header: "Paid By",
    cell: ({ row }) => {
      const p = row.original.paymentBy;
      return (
        <div className="flex flex-col">
          <span>{p.name}</span>
          <span className="text-xs text-gray-500">{p.email}</span>
          <span className="text-xs text-gray-500">{p.phoneNo}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "Mode",
    header: "Mode",
  },
  {
    accessorKey: "PaymentDate",
    header: "Payment Date",
    cell: ({ row }) =>
      new Date(row.original.PaymentDate).toLocaleDateString(),
  },
  {
    accessorKey: "PaymentProofUrl",
    header: "Payment Proof",
    cell: ({ row }) =>
      row.original.PaymentProofUrl ? (
        <button
          onClick={() => openProofDialog(row.original.PaymentProofUrl!)}
          className="text-blue-600 underline hover:text-blue-800"
        >
          View Proof
        </button>
      ) : (
        <span className="text-gray-400 italic">No proof</span>
      ),
  },
  {
    accessorKey: "Remarks",
    header: "Remarks",
    cell: ({ row }) => row.original.Remarks || "—",
  },
  {
    accessorKey: "caseAssignments",
    header: "Cases",
    cell: ({ row }) => (
      <ul className="list-disc list-inside text-sm max-h-24 overflow-auto">
        {row.original.caseAssignments.map((assignment) => (
          <li key={assignment.id}>
            {assignment.case.caseNo} (₹{assignment.TotalAmount.toFixed(2)})
            <br />
            <span className="text-xs text-gray-500">
              Vehicle: {assignment.case.vehicleDetail.vehicleNo}
            </span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="text-center space-x-2">
        <Button
          variant="outline"
          className="text-green-600 border-green-600 hover:bg-green-100"
          title="Verify Payment"
          onClick={() => onVerify(row.original.id)}
        >
          ✓
        </Button>
        <Button
          variant="outline"
          className="text-red-600 border-red-600 hover:bg-red-100"
          title="Reject Payment"
          onClick={() => onReject(row.original.id)}
        >
          ✗
        </Button>
      </div>
    ),
  },
];


const verifyPayment = () => {
    const [open, setOpen] = useState(false);
    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
    };
    const toast = useToast();
    const [dialogOpen, setDialogOpen] = useState(false);
    const { setLoading } = useLoading();
    const [payments, setPayments] = useState<PaymentData[]>([]);
    const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);

    useEffect(() => {
        setLoading(true);
        getUnPayments()
            .then((resp) => {

                setPayments(resp?.data);
            })
            .catch((error) => {
                toast.showToast('Error:', error, 'error')
            })
            .finally(() => setLoading(false));
    }, []);


    const onVerify = (paymentId: string) => {

        console.log("Verify payment", paymentId);
    };

    const onReject = (paymentId: string) => {

        console.log("Reject payment", paymentId);
    };



    const openProofDialog = (url: string) => {
        setSelectedProofUrl(url);
        setDialogOpen(true);
    };

    const closeProofDialog = () => {
        setSelectedProofUrl(null);
        setDialogOpen(false);
    };


    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarTrigger />
            <div className="flex flex-col w-full bg-white px-6 py-4 h-full min-h-screen">
                {/* Logout Dialog */}
                <div className="flex justify-end mb-4">
                    <Button variant="destructive" className="cursor-pointer hover:bg-red-800" onClick={() => setOpen(true)}>
                        Logout
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Logout</DialogTitle>
                                <DialogDescription>Are you sure you want to logout?</DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" className="hover:bg-red-800" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
                {/* Payment Table */}
                <div className="flex-grow overflow-auto">
                    
                 <DataTable columns={paymentTableColumns(openProofDialog,onVerify,onReject)} data={payments} />
                {/* Proof Dialog */}
                <Dialog open={dialogOpen} onOpenChange={closeProofDialog}>
                    <DialogContent className="max-w-3xl max-h-[80vh] p-4">
                        <DialogHeader>
                            <DialogTitle>Payment Proof</DialogTitle>
                        </DialogHeader>
                        {selectedProofUrl && (
                            <img
                                src={selectedProofUrl}
                                alt="Payment Proof"
                                className="max-w-full max-h-[70vh] object-contain rounded-md"
                            />
                        )}
                        <div className="flex justify-end mt-4">
                            <Button variant="outline" onClick={closeProofDialog}>
                                Close
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
            </div>
        </SidebarProvider>
    );
};

export default verifyPayment;