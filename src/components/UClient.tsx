import { useEffect, useState, type FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLoading } from "@/components/LoadingContext";
import { useToast } from "@/context/ToastContext";
import { getClient, rejectClient, verifyClient } from "@/service/client.service";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "./DataTable";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import { useAuth } from "@/context/AuthContext";

export interface NewClient {
  id: string;
  firstName: string;
  lastName: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  email: string;
  mobileNo: string;
  firmName: string;
  isVerified: boolean;
  creditLimit?: number;
  users: {
    id: string;
    branchCode?: string;
    employeeCode?: string;
    firstName: string;
    lastname: string;
    email: string;
    phoneNo: string;
    role: string;
    isVerified: string;
  }[]
}

export default function UClient() {
  const [verifiedClients, setVerifiedClients] = useState<NewClient[]>([]);
  const [unverifiedClients, setUnverifiedClients] = useState<NewClient[]>([]);
  const { setLoading } = useLoading();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<NewClient | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [currentTab, setCurrentTab] = useState<'verified' | 'unverified'>('unverified');
  const toast = useToast();
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const navigate = useNavigate();
  const {logout} = useAuth();



  const clients = currentTab === 'verified' ? verifiedClients : unverifiedClients;

  const handleReject = async () => {
    if (!selectedClient) return;

    setLoading(true);
    await rejectClient(selectedClient.id).then(() => {
      toast.showToast("Rejection:", "Client Rejected", "success");
      setRefreshFlag((prev) => !prev);
    }).

      catch((err: any) => {
                if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        toast.showToast("Error:", err?.message || 'Rejection was not done due to errors', "error");
      })
      .finally(() => {
        setLoading(false);
        setSelectedClient(null);
        setRejectDialogOpen(false);
      })

  };


  useEffect(() => {
    setLoading(true);
    getClient()
      .then((resp: any) => {
        const verified = resp.data.find((group: any) => group.isVerified)?.clients || [];
        const unverified = resp.data.find((group: any) => !group.isVerified)?.clients || [];
        setVerifiedClients(verified);
        setUnverifiedClients(unverified);
      })
      .catch((err: any) =>{
                if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
         toast.showToast('Error:', err?.message || 'Error during fetch of Clients', 'error')}
      )
      .finally(() => setLoading(false));
  }, [refreshFlag]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const creditLimit = Number(formData.get("creditLimit"));
    const fixedPenalty = Number(formData.get("fixedPenalty"));

    if (selectedClient) {
      await verifyClient(selectedClient?.id ?? "", creditLimit, fixedPenalty);
      setDialogOpen(false);
      setSelectedClient(null);
      setRefreshFlag((prev) => !prev);
      toast.showToast('Success:', 'Client Verified', 'success');
      setLoading(false);
    }
  };

  const getClientColumns = (
    currentTab: "verified" | "unverified",
    setSelectedClient: (client: NewClient) => void,
    setDialogOpen: (open: boolean) => void
  ): ColumnDef<NewClient>[] => [
      {
        id: "serial",
        header: "S.No",
        cell: ({ row }) => row.index + 1, // Calculate the serial number based on visible row index
        enableSorting: false, // Disable sorting for this column
        size: 50, // Optional: Adjust width
      },
      {
        header: "Name",
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      },
      {
        header: "City",
        accessorFn: (row) =>
          `${row.city}`,
      },
      {
        header: "Contact",
        accessorFn: (row) => `${row.email} | ${row.mobileNo}`,
      },
      {
        header: "Firm Name",
        accessorKey: "firmName",
      },
      {
        id: "action_or_credit",
        header: currentTab === "verified" ? "Credit Limit" : "Action",
        cell: ({ row }) => {
          const client = row.original;

          if (currentTab === "verified") {
            return <span>{client.creditLimit ?? "N/A"}</span>;
          }

          return (
            <div className="flex gap-2">
              <Button
                style={{ cursor: "pointer" }}
                variant="default"
                size="icon"
                onClick={() => {
                  setSelectedClient(client);
                  setDialogOpen(true);
                }}
              >
                ✔
              </Button>
              <Button
                style={{ cursor: "pointer" }}
                variant="destructive"
                size="icon"
                onClick={() => {
                  setSelectedClient(client);
                  setRejectDialogOpen(true);
                }}
              >
                ✖
              </Button>
            </div>
          );
        },
      },
      {
        id: "viewDetails",
        header: "View Details",
        cell: ({ row }) => {

          if (currentTab === "verified") {
            return (
              <Button
                style={{ cursor: "pointer" }}
                variant="default"
                size="sm"
                color="white"
                onClick={() => navigate("/superadmin/clients/clientDetails", { state: { client: row.original } })}
              >
                View Details
              </Button>
            )
          }
          else {
            <span>No Details Available Yet</span>
          }
        },
      },
    ];

  return (
    <div className="flex flex-col w-full bg-white pr-6 lg:py-10 min-h-[100vh]">
      <div className="flex gap-4 mb-4">
        {unverifiedClients.length > 0 ? (
          <Button
            style={{ cursor: "pointer", position: "relative" }}
            className={`relative transition-colors duration-200 ${currentTab === "unverified"
                ? "bg-[#5156DB] text-white hover:bg-[#4146b5]"
                : "bg-[#F5F5F5] text-[#333] hover:bg-[#e5e5e5] hover:text-[#111]"
              }`}
            onClick={() => setCurrentTab("unverified")}
          >
            Unverified Clients
            <Badge
              className="absolute -top-2 -right-2 bg-red-600 text-white px-2 py-0.5 text-xs"
            >
              {unverifiedClients.length}
            </Badge>
          </Button>
        ) : (
          <Button
            style={{ cursor: "pointer" }}
            className={`transition-colors duration-200 ${currentTab === "unverified"
                ? "bg-[#5156DB] text-white hover:bg-[#4146b5]"
                : "bg-[#F5F5F5] text-[#333] hover:bg-[#e5e5e5] hover:text-[#111]"
              }`}
            onClick={() => setCurrentTab("unverified")}
          >
            Unverified Clients
          </Button>
        )}

        <Button
          style={{ cursor: "pointer" }}
          className={`transition-colors duration-200 ${currentTab === "verified"
              ? "bg-[#5156DB] text-white hover:bg-[#4146b5]"
              : "bg-[#F5F5F5] text-[#333] hover:bg-[#e5e5e5] hover:text-[#111]"
            }`}
          onClick={() => setCurrentTab("verified")}
        >
          Verified Clients
        </Button>




      </div>
      <div className="flex-1 overflow-auto">
        <DataTable columns={getClientColumns(currentTab, setSelectedClient, setDialogOpen)} data={clients} />
      </div>
      {/* <DataTable columns={getClientColumns(currentTab, setSelectedClient, setDialogOpen)} data={clients} /> */}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Client</DialogTitle>
            <DialogDescription>
              Enter Credit Limit and Fixed Penalty to verify this client.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="creditLimit">Credit Limit</Label>
              <Input
                id="creditLimit"
                name="creditLimit"
                type="number"
                required
                placeholder="Enter credit limit"
                pattern="[0-9]*"
                inputMode="numeric"
                min="0"
              />
            </div>

            <div className="flex flex-col gap-1">
              <Label htmlFor="fixedPenalty">Fixed Penalty</Label>
              <Input
                id="fixedPenalty"
                name="fixedPenalty"
                type="number"
                required
                placeholder="Enter penalty amount"
                pattern="[0-9]*"
                inputMode="numeric"
                min="0"
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button style={{ cursor: "pointer" }} type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button style={{ cursor: "pointer" }} type="submit">Confirm</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Client</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this client? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button
              style={{ cursor: "pointer" }}
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              style={{ cursor: "pointer" }}
              variant="destructive"
              onClick={handleReject}
            >
              Reject
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
