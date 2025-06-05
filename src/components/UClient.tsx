import { useState, useEffect, type FormEvent } from "react";
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
import { useToast } from "@/context/ToastContext";

export default function UClient() {
  const [clients, setClients] = useState<NewClient[]>([]);
  const { setLoading } = useLoading();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<NewClient | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItemsper] = useState("10"); // Default to 10 entries
  const toast = useToast();
  const items_per_page = parseInt(items, 10);

  const isEntryLimitValid = items_per_page >= 1 && items_per_page <= 20;
  const ITEMS_PER_PAGE = items_per_page;
  const totalPages = isEntryLimitValid
    ? Math.ceil(clients.length / ITEMS_PER_PAGE)
    : 1;

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedClients = isEntryLimitValid
    ? clients.slice(startIdx, startIdx + ITEMS_PER_PAGE)
    : [];

  useEffect(() => {
    setLoading(true);
    getUClient()
      .then((resp) => setClients(resp?.data || []))
      .catch((err) => toast.showToast('Error in Fetching:',err,'error'))
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
      toast.showToast('Affirmation:','Client Verified','success');
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
                      style={{cursor:"pointer"}}
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
                      style={{cursor:"pointer"}}
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
        <div className="flex items-center justify-end mb-4">
          <Label htmlFor="entryLimit" className="mr-2 font-medium">
            No of entries:
          </Label>
                      <Select
          value={items}
          onValueChange={(val) => setItemsper(val)}
        >
          <SelectTrigger id="entryLimit" className="w-24">
        <SelectValue placeholder="Entries" />
          </SelectTrigger>
          <SelectContent>
        <SelectItem value="10">10</SelectItem>
        <SelectItem value="15">15</SelectItem>
        <SelectItem value="20">20</SelectItem>
          </SelectContent>
        </Select>
        </div>
        {items !== "" && !isEntryLimitValid && (
          <div className="text-red-500 text-right text-xs mb-2">
            Please enter a value between 1 and 20.
          </div>
        )}

        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationItem>
              <button
              style={{cursor:"pointer"}}
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
              style={{cursor:"pointer"}}
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
                <Button style={{cursor:"pointer"}} type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button style={{cursor:"pointer"}} type="submit">Confirm</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </>
    </div>
  );
}
