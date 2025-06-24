import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
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
import { getUnPayments, rejectPayment } from "@/service/case.service";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { verifyPayments } from "@/service/case.service";
type paymentBy = {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
};

type caseAssignment = {
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
  paymentBy: paymentBy;
  Amount: number;
  Mode: string;
  PaymentDate: string;
  PaymentProofUrl: string;
  Remarks: string;
  caseAssignments: caseAssignment[];
};

const paymentTableColumns = (
  openProofDialog: (url: string) => void,
  onVerify: (id: string) => void,
  onReject: (id: string) => void
): ColumnDef<PaymentData>[] => [
    // {
    //   accessorKey: "id",
    //   header: "Payment ID",
    //   cell: ({ row }) => <span className="font-mono text-sm">{row.original.id}</span>,
    // },
    {
      // accessorKey: "paymentBy",
      header: "Paid By",
      // accessorFn:(row)=>`${row.paymentBy}`,
      cell: ({ row }) => {
        const { name, phoneNo, id } = row.original.paymentBy;
        return id ? `${name} | ${phoneNo}` : ``;
      }
    },
    {
      id: "Amount",
      header: "Amount",
      cell: ({ row }) =>
        `₹ ${(+row.original.Amount).toFixed(2)}`,
    },
    {
      accessorKey: "Mode",
      header: "Mode",
    },
    {
      // accessorKey: "PaymentDate",
      header: "Payment Date",
      cell: ({ row }) =>
        new Date(row.original.PaymentDate).toLocaleDateString(),
    },
    {
      id: "viewProof",
      header: "Payment Proof",
      cell: ({ row }) =>
        row.original.PaymentProofUrl ? (
          <button
            style={{ cursor: "pointer" }}
            onClick={() => openProofDialog(row.original.PaymentProofUrl!)}
            className="text-blue-600 underline hover:text-blue-800"
            type="button"
          >
            View Proof
          </button>
        ) : (
          <span className="text-gray-400 italic">No proof</span>
        ),
    },
    // {
    //   accessorKey: "PaymentProofUrl",
    //   header: "Payment Proof",
    //   cell: ({ row }) =>
    //     row.original.PaymentProofUrl ? (
    //       <button
    //         onClick={() => openProofDialog(row.original.PaymentProofUrl!)}
    //         className="text-blue-600 underline hover:text-blue-800"
    //       >
    //         View Proof
    //       </button>
    //     ) : (
    //       <span className="text-gray-400 italic">No proof</span>
    //     ),
    // },
    {
      accessorKey: "Remarks",
      header: "Remarks",
      cell: ({ row }) => row.original.Remarks || "—",
    },
    {
      // accessorKey: "caseAssignments",
      header: "Cases",
      cell: ({ row }) => (
        <ul className="list list-inside text-sm max-h-24 overflow-auto">
          {row.original.caseAssignments.map((assignment) => (
            <li className="list-item" key={assignment.id}>
              {assignment.case.caseNo} (₹{assignment.TotalAmount})
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
            variant="default"
            style={{cursor:"pointer"}}
            title="Verify Payment"
            onClick={() => onVerify(row.original.id)}
          >
            ✓
          </Button>
          <Button
            variant="destructive"
            style={{cursor:"pointer"}}
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
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [flag, setflag] = useState(false);
  const { setLoading } = useLoading();
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [selectedProofUrl, setSelectedProofUrl] = useState<string | null>(null);
  const [actionDialog, setActionDialog] = useState<{
  type: "verify" | "reject";
  paymentId: string | null;
}>({ type: "verify", paymentId: null });

const [actionConfirmOpen, setActionConfirmOpen] = useState(false);


  useEffect(() => {
    setLoading(true);
    getUnPayments()
      .then((resp) => {
        const responseData = resp?.data
        setPayments(responseData);

        if(responseData.length == 0)
        {
          toast.showToast('Information','No new Payments to verify','info')
        }
      })
      .catch((error) => {
        toast.showToast('Error:', error?.message || 'Error in fetching Unverified Payments', 'error')
      })
      .finally(() => setLoading(false));
  }, [flag]);


  const onVerify = (paymentId: string) => {
  setActionDialog({ type: "verify", paymentId });
  setActionConfirmOpen(true); // Open the confirmation dialog
};

const onReject = (paymentId: string) => {
  setActionDialog({ type: "reject", paymentId });
  setActionConfirmOpen(true); // Open the confirmation dialog
};
const handleConfirmAction = () => {
  if (!actionDialog.paymentId) return;
  setLoading(true);
  const action = actionDialog.type === "verify" ? verifyPayments : rejectPayment;

  action(actionDialog.paymentId)
    .then(() => {
      toast.showToast(
        "Success",
        actionDialog.type === "verify" ? "Verified the Payment" : "Rejected the Payment",
        "success"
      );
    })
    .catch((err) => {
      toast.showToast("Error", err?.message || 'Unable to proceed with the Process due to error', "error");
    })
    .finally(() => {
      setLoading(false);
      setflag(f=>!f);
      setActionConfirmOpen(false); // Close the dialog after action
    });
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
      <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh]">
        {/* Logout Dialog */}
        {/* <div className="flex justify-end mb-4">
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
                <Button variant="outline" style={{cursor:"pointer"}} onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" style={{cursor:"pointer"}} className="hover:bg-red-800" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div> */}

  <Dialog open={actionConfirmOpen} onOpenChange={setActionConfirmOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        Confirm {actionDialog.type === "verify" ? "Verification" : "Rejection"}
      </DialogTitle>
      <DialogDescription>
        Are you sure you want to {actionDialog.type === "verify" ? "verify" : "reject"} this payment?
      </DialogDescription>
    </DialogHeader>
    <div className="flex justify-end gap-2 mt-4">
      <Button style={{cursor:"pointer"}} variant="outline" onClick={() => setActionConfirmOpen(false)}>
        Cancel
      </Button>
      <Button
      style={{cursor:"pointer"}}
        variant={actionDialog.type === "verify" ? "default" : "destructive"}
        onClick={handleConfirmAction}
      >
        Confirm
      </Button>
    </div>
  </DialogContent>
</Dialog>

        {/* Payment Table */}
        <div className="flex flex-col w-full h-full min-h-screen overflow-y-auto overflow-auto">

          <DataTable columns={paymentTableColumns(openProofDialog, onVerify, onReject)} data={payments} />
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
                <Button style={{cursor:"pointer"}} variant="outline" onClick={closeProofDialog}>
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