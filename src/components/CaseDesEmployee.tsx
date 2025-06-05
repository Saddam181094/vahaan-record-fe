import { useState, useEffect } from "react";
import { useLoading } from "./LoadingContext";
import { getAllCasesE } from "@/service/case.service";
import { useNavigate } from "react-router-dom";
import { type CaseDetails } from "@/components/CaseDesAdmin"
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useForm } from "react-hook-form";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { FaEye } from "react-icons/fa";
import { Label } from "@radix-ui/react-label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useToast } from "@/context/ToastContext";

export default function CaseDes() {
  useForm<CaseDetails>();
  const navigate = useNavigate(); // ✅ Add this

  const [cases, setCases] = useState<CaseDetails[]>([]);
  const { setLoading } = useLoading();
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    getAllCasesE()
      .then((resp) => {
        setCases(resp?.data)})
      .catch((err: any) => {
        toast.showToast('Error fetching cases:',err,'error');
        // console.error("Error fetching cases:", err)
        })
      .finally(() => setLoading(false));
  }, []);

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
    setCurrentPage(1); // Reset to first page when limit changes
  }, [items_per_page]);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No.</TableHead>
            <TableHead>Vehicle No.</TableHead>
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
                className={idx % 2 === 1 ? "bg-gray-200 dark:bg-gray-900" : ""}
              >
                <TableCell># {Case.CaseNo}</TableCell>
                <TableCell>{Case?.vehicleDetail?.vehicleNo}</TableCell>
                <TableCell>{Case.status}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/employee/cases/${Case.CaseNo}`, {
                        state: { id: Case.id },
                      })
                    }
                    title="View Details"
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontSize: "1.2rem",
                      color: "#000", // default color
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#007bff")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#000")}
                  >
                    <FaEye />
                  </button>
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
    </div>
  );
}