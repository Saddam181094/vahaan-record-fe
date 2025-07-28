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
import { useAuth } from "@/context/AuthContext";

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
  applicationNo?:string;
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
  const {logout} = useAuth();
  const [flag,setflag] = useState(false); // For re-rendering
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
         if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
      toast.showToast("Error", err?.message || 'Verification error Occured', 'error');
    }).finally(() => {
        setflag(f => !f);
      setLoading(false);
    })
  };

  useEffect(() => {
    setLoading(true);
    getAdminCases()
      .then((resp) => 
      {
        if (!resp?.data || resp.data.length === 0) {
          toast.showToast('Info:', 'No records found.', 'info');
        }
        setCases(resp?.data);
        setLoading(false);
      }
        )
      .catch((err: any) =>  {
           if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        toast.showToast("Error", err?.message || 'Error fetching Branches', 'error')})
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
            className="mb-4 bg-[#5156DB]"
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
              header: "Actions",
              cell: ({ row }) => {
                const data = row.original;
                const isDisabled = !data?.generalDetail?.appointmentDate;

                return (
                  <div className="flex gap-2">
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
                                    <Button
                  variant="outline"
                  style={{cursor:"pointer"}}
                    onClick={() =>
                      navigate(`/superadmin/cases/${data.CaseNo}`, {
                        state: { id: data.id, status: data.status },
                      })
                    }
                    title="View Details"
                    className="text-black hover:text-blue-600"
                  >
                    {/* <FaEye />
                     */}
                     View Details
                  </Button>
                  </div>
                );
              },

            },
            ]}
            data={cases.filter((items) => String(items.status) === 'Created' || String(items.status) === 'Updated')}
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
              Verify
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
