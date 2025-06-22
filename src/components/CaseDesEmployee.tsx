import { useState, useEffect } from "react";
import { useLoading } from "./LoadingContext";
import { getAllCasesE, verifyCase } from "@/service/case.service";
import { useNavigate } from "react-router-dom";
import { type CaseDetails } from "@/components/CaseDesAdmin"
import { useForm } from "react-hook-form";
import { FaEye } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import { DataTable } from "./DataTable";
import { employeeCaseTableColumns } from "@/lib/tables.data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function CaseDes() {
  useForm<CaseDetails>();
  const navigate = useNavigate(); // ✅ Add this

  const [cases, setCases] = useState<CaseDetails[]>([]);
  const { setLoading } = useLoading();
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);

  const handleVerify = () => {
    setLoading(true);
    if (!selectedCaseId) 
    {
      toast.showToast('Error:','No Valid CaseId is Provided','error')
      setLoading(false);
    };
    
    verifyCase(selectedCaseId).then(()=>{
    toast.showToast('Affirmation', 'Case verified Succesfully', 'success');
    setDialogOpen(false);
   
    }).catch((err:any)=>{
      toast.showToast("Error", err?.message || 'Verification error Occured', 'error');
    }).finally(()=>{
    setLoading(false);
    })
  };

  useEffect(() => {
    setLoading(true);
    getAllCasesE()
      .then((resp) => {
        setCases(resp?.data)})
      .catch((err: any) => {
        toast.showToast('Error:',err?.message || 'Error fetching cases:','error');
        // console.error("Error fetching cases:", err)
        })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
     <DataTable
        columns={[
          ...employeeCaseTableColumns,
          {
            id: "action",
            header: "Action",
            cell: ({ row }) => {
              const data = row.original;

              return (
                <button
                  title="View Details"
                  onClick={() =>
                    navigate(`/employee/cases/${data.CaseNo}`, {
                      state: { id: data.id },
                    })
                  }
                  className="text-black hover:text-blue-600 transition-colors"
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.2rem",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#007bff")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#000")}
                >
                  <FaEye />
                </button>
              );
            },
          },
{
  id: "verify",
  header: "Verify",
  cell: ({ row }) => {
  const data = row.original;
  const isDisabled = !data?.generalDetail?.appointmentDate && !data?.generalDetail?.applicationNo;

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
        data={cases}
      />
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