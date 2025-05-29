import { useState, useEffect,type FormEvent } from "react";
import type { NewClient } from "../pages/Clientsignup";
import { getUClient, verifyClient } from "@/service/client.service";
// import Loader from "@/components/GlobalLoader";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLoading } from "./LoadingContext";

export default function UClient() {
  const [clients, setClients] = useState<NewClient[]>([]);
const {setLoading} = useLoading();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<NewClient | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 10;
  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = clients.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  useEffect(() => {
    setLoading(true);
    getUClient()
      .then((resp) => setClients(resp?.data || []))
      .catch((err) => console.error("Error fetching clients:", err))
      .finally(() => setLoading(false));
  }, [refreshFlag]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    setLoading(true);
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const creditLimit = Number(formData.get("creditLimit"));
    const fixedPenalty = Number(formData.get("fixedPenalty"));

    if (selectedClient) {
      await verifyClient(selectedClient?.id?? "", creditLimit, fixedPenalty);
      setDialogOpen(false);
      setSelectedClient(null);
      setRefreshFlag((prev) => !prev);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full bg-white px-6 py-4 min-h-screen">
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Firm Name</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>{client.firstName} {client.lastName}</TableCell>
                    <TableCell>
                      {client.address1}, {client.address2}, {client.city}, {client.state}, {client.pincode}
                    </TableCell>
                    <TableCell>{client.email} | {client.mobileNo}</TableCell>
                    <TableCell>{client.firmName}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                      <Button
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
                        variant="destructive"
                        size="icon"
                        onClick={() => {
                        // Optionally handle "Not Approve" logic here
                        }}
                      >
                        ✖
                      </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          <Pagination className="mt-4">
            <PaginationContent>
              <PaginationItem>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="disabled:opacity-50"
                >
                  <PaginationPrevious />
                </button>
              </PaginationItem>
              <PaginationItem className="px-4 text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </PaginationItem>
              <PaginationItem>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="disabled:opacity-50"
                >
                  <PaginationNext />
                </button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {/* Shared Dialog */}
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
                    type="text"
                    required
                    placeholder="Enter credit limit"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="fixedPenalty">Fixed Penalty</Label>
                  <Input
                    id="fixedPenalty"
                    name="fixedPenalty"
                    type="text"
                    required
                    placeholder="Enter penalty amount"
                  />
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Confirm</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </>
    </div>
  );
}
