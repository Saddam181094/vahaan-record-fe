import { useState, useEffect } from "react";
import { useLoading } from "./LoadingContext";
import { getAdminCases, verifyCase } from "@/service/case.service";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import CaseDetails from "./CaseDetailsAdmin";
import { useToast } from "@/context/ToastContext";
import { DataTable } from "./DataTable";
import { caseTableColumns } from "@/lib/tables.data";
import { DialogDescription } from "@radix-ui/react-dialog";

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

// Inside your TableCell, after the FaEye button:
export default function CaseDes() {
  useForm<CaseDetails>();
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseDetails[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setLoading } = useLoading();
  const toast = useToast();
  const [flag] = useState(false); // For re-rendering
  // console.log(cases);


  const handleVerify = () => {
    setLoading(true);
    if (!selectedCaseId) {
      toast.showToast('Error:', 'No Valid CaseId is Provided', 'error')
      setLoading(false);
    };

    verifyCase(selectedCaseId).then(() => {
      toast.showToast('Affirmation', 'Case verified Succesfully', 'success');
      setDialogOpen(false);

    }).catch((err: any) => {
      toast.showToast("Error", err?.message || 'Verification error Occured', 'error');
    }).finally(() => {
      setLoading(false);
    })
  };

  useEffect(() => {
    setLoading(true);
    getAdminCases()
      .then((resp) => 
      {
        setCases(resp?.data);
        setLoading(false);
      }
        )
      .catch((err: any) =>  toast.showToast("Error", err?.message || 'Error fetching Branches', 'error'))
      .finally(() => {
        setLoading(false)});
  }, [flag]);

  return (
    <div>
      {
        <>
          <Button
            style={{ cursor: "pointer" }}
            variant="default"
            className="mb-4"
            onClick={() => {
              setLoading(true);
              navigate("/superadmin/cases/new")
            }}
          >
            Add New Case
          </Button>
          <DataTable
            columns={[...caseTableColumns,
            {
              id: "verify",
              header: "Verify",
              cell: ({ row }) => {
                const data = row.original;
                const isDisabled = !data?.generalDetail?.appointmentDate;

                return (
                  <Button
                    variant="outline"
                    style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
                    disabled={isDisabled}
                    onClick={() => {
                      // console.log(data.id);
                      setSelectedCaseId(data.id);
                      setDialogOpen(true);
                    }}
                  >
                    Verify
                  </Button>
                );
              },

            },
            ]}
            data={cases.filter((items) => String(items.status) === 'Created')}
          />


        </>
      }

      <Dialog open={dialogOpen} onOpenChange={(isOpen) => {
        if (!isOpen) {
          setDialogOpen(false);
          setSelectedCaseId(null);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Case</DialogTitle>
            <DialogDescription>
              Are you sure you want to verify case <b>{cases.find(c => c.id === selectedCaseId)?.CaseNo}</b>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="secondary"
              style={{ cursor: "pointer" }}
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              style={{ cursor: "pointer" }}
              onClick={handleVerify}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
