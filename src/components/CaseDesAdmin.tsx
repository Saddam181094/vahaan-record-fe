import { useState, useEffect } from "react";
import { useLoading } from "./LoadingContext";
import { getAllCases } from "@/service/case.service";
import { useNavigate } from "react-router-dom";
import { Label } from "@radix-ui/react-label";
import { FaEye } from "react-icons/fa";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getActiveClients } from "@/service/client.service";
import { useForm } from "react-hook-form";
import CaseDetails from "./CaseDetailsAdmin";
import { assignCase } from "@/service/case.service";
import { useToast } from "@/context/ToastContext";
import { DataTable } from "./DataTable";
import { caseTableColumns } from "@/lib/tables.data";

export interface CaseDetails {
  id: string;
  CaseNo: string;
  vehicleDetail: vehicleDetail;
  createdBy: createdBy;
  status: string;
}
export interface createdBy {
  firstName: string;
  lastName: string;
  employeeCode: string;
}

export interface vehicleDetail {
  vehicleNo: string;
}


function AssignDialog({ caseNo, caseId, disabled,clients }: { caseNo: string, caseId: string, disabled?: boolean,clients:any[] }) {
  const [open, setOpen] = useState(false);
  const { setLoading } = useLoading();
  // const [refreshFlag] = useState(false);
  const [search, setSearch] = useState("");
  const toast = useToast();

  const { register, handleSubmit, setValue, watch, reset } = useForm<{ clientId: string }>({
    defaultValues: { clientId: "" },
  });

  const selectedClient = watch("clientId");

  const onSubmit = (data: { clientId: string }) => {

    setLoading(true);
    assignCase(caseId, data.clientId).
      then(() => {
        // console.log(resp?.data);
        toast.showToast('Affirmation', 'Case Assigned Successfully.', 'success');
      }).catch((err: any) => {
        toast.showToast('Error Assigning Case', err, 'error');
      })
      .finally(() => setLoading(false));
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) reset(); }}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className="ml-2"
          style={{ cursor: "pointer" }}
          disabled={disabled}
        >
          Assign
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Case {caseNo} to Dealer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clients" className="font-bold">Dealers</Label>
            <hr />
            <Select
              onValueChange={(value) => setValue("clientId", value)}
              value={selectedClient}
            >
              <SelectTrigger id="clients" className="w-full">
                <SelectValue placeholder="Select Dealer" />
              </SelectTrigger>
              <SelectContent className="w-full">
                <div className="p-2">
                  <Input
                    placeholder="Search a State"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="mb-2"
                  />
                </div>
                {clients.map((client: any) => (
                  <SelectItem key={client.id} value={client.id} className="w-full">
                    {client.firstName} {client.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Register the field for react-hook-form */}
            <input type="hidden" {...register("clientId", { required: true })} />
          </div>
          <DialogFooter>
            <Button style={{ cursor: "pointer" }} type="submit" disabled={!selectedClient}>Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Inside your TableCell, after the FaEye button:
export default function CaseDes() {
  useForm<CaseDetails>();
  const navigate = useNavigate();
  const [cases, setCases] = useState<CaseDetails[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const { setLoading } = useLoading();
  const toast = useToast();

    useEffect(() => {
    setLoading(true);
    getActiveClients()
      .then((resp) => {
        setClients(resp?.data || []);
      })
      .catch((err: any) => {
        toast.showToast('Error fetching firms', err, 'error');
        // console.error("Error fetching firms:", err);
        setClients([]);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    getAllCases()
      .then((resp) => setCases(resp?.data))
      .catch((err: any) => console.error("Error fetching cases:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {
        <>
          <DataTable
            data={cases}
            columns={[...caseTableColumns,
            {
              header: "Action",
              accessorKey: "action",
              cell: ({ row }: any) => {
                const caseData = row.original;
                return (
                  <div className="flex center flex-row gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        navigate(`/superadmin/cases/${caseData.CaseNo}`, {
                          state: { id: caseData.id, status: caseData.status },
                        })
                      }
                      title="View Details"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.2rem",
                        color: "#000",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = "#007bff")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#000")
                      }
                    >
                      <FaEye />
                    </button>
                    {caseData.status?.toLowerCase() !== "assigned" &&
                      caseData.status?.toLowerCase() !== "created" && (
                        <AssignDialog
                          caseNo={caseData.CaseNo}
                          caseId={caseData.id}
                          clients={clients}
                        />
                      )}
                  </div>
                );
              },
            },
            ]}
          />


        </>
      }
    </div>
  );
}
