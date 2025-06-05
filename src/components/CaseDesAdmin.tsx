import { useState, useEffect } from "react";
import { useLoading } from "./LoadingContext";
import { getAllCases } from "@/service/case.service";
import { useNavigate } from "react-router-dom";
import { Label } from "@radix-ui/react-label";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { FaEye } from "react-icons/fa";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getActiveClients } from "@/service/client.service";
import { useForm } from "react-hook-form";
import CaseDetails from "./CaseDetailsAdmin";
import { assignCase } from "@/service/case.service";

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


function AssignDialog({ caseNo, caseId, disabled }: { caseNo: string, caseId: string, disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [clients, setClients] = useState<any[]>([]);
  const { setLoading } = useLoading();
  const [refreshFlag] = useState(false);
  const [search,setSearch] = useState("");

  const { register, handleSubmit, setValue, watch, reset } = useForm<{ clientId: string }>({
    defaultValues: { clientId: "" },
  });

  const selectedClient = watch("clientId");

  useEffect(() => {
    setLoading(true);
    getActiveClients()
      .then((resp) => {
        setClients(resp?.data || []);
      })
      .catch((err: any) => {
        console.error("Error fetching firms:", err);
        setClients([]);
      })
      .finally(() => setLoading(false));
  }, [refreshFlag]);

  const onSubmit = (data: { clientId: string }) => {

    setLoading(true);
    assignCase(caseId, data.clientId).
      then((resp) => {
        console.log(resp?.data);
        alert("Successfully assigned the case");
      }).finally(() => setLoading(false));
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
            <Button style={{cursor:"pointer"}} type="submit" disabled={!selectedClient}>Submit</Button>
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
  const { setLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItemsper] = useState("10"); // Default to 10 entries
  const items_per_page = parseInt(items, 10);

  const isEntryLimitValid = items_per_page >= 1 && items_per_page <= 20;
  const ITEMS_PER_PAGE = items_per_page;
  const totalPages = isEntryLimitValid
    ? Math.ceil(cases.length / ITEMS_PER_PAGE)
    : 1;

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFirms = isEntryLimitValid
    ? cases.slice(startIdx, startIdx + ITEMS_PER_PAGE)
    : [];

  useEffect(() => {
    setLoading(true);
    getAllCases()
      .then((resp) => setCases(resp?.data))
      .catch((err: any) => console.error("Error fetching cases:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when limit changes
  }, [items_per_page]);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div>
      {
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Vehicle No.</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedFirms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    No Cases found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedFirms.map((Case, idx) => (
                  <TableRow
                    key={Case.CaseNo}
                    className={
                      idx % 2 === 1 ? "bg-gray-200 dark:bg-gray-900" : ""
                    }
                  >
                    <TableCell>#{Case.CaseNo}</TableCell>
                    <TableCell>{Case?.vehicleDetail?.vehicleNo}</TableCell>
                    <TableCell>
                      {Case.createdBy.firstName} {Case.createdBy.lastName} |{" "}
                      {Case.createdBy.employeeCode}
                    </TableCell>
                    <TableCell>{Case.status}</TableCell>
                    <TableCell className="flex flex-row gap-4">
                      <button
                      type="button"
                      onClick={() =>
                        navigate(`/superadmin/cases/${Case.CaseNo}`, {
                        state: { id: Case.id, status: Case.status }
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
                      {Case.status?.toLowerCase() !== "assigned" &&
                      Case.status?.toLowerCase() !== "created" && (
                        <AssignDialog
                        caseNo={Case.CaseNo}
                        caseId={Case.id}
                        />
                      )}
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
            <Input
              id="entryLimit"
              type="number"
              min="1"
              max="20"
              value={items_per_page === 0 ? "" : items_per_page}
              onChange={(e) => {
                const val = e.target.value;
                setItemsper(val === "" ? "" : val);
              }}
              className="border rounded px-3 py-1 w-20 text-sm"
            />
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
                  type="button"
                  onClick={handlePrev}
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
                  type="button"
                  onClick={handleNext}
                  disabled={currentPage === totalPages}
                  className="disabled:opacity-50"
                >
                  <PaginationNext />
                </button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      }
    </div>
  );
}
