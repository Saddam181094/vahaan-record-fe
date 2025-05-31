import { useState, useEffect } from "react";
import { useLoading } from "./LoadingContext";
import { getAllCases } from "@/service/case.service";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { FaEye } from "react-icons/fa";
import { useForm } from "react-hook-form";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface CaseDetails {
  id: string,
  CaseNo: string,
  vehicleDetail: vehicleDetail,
  createdBy: createdBy,
  status: string,

}
export interface createdBy {
  firstName: string,
  lastName: string,
  employeeCode: string
}

export interface vehicleDetail {
  vehicleNo: string,
}
export default function CaseDes() {
  useForm<CaseDetails>();
  const navigate = useNavigate(); // ✅ Add this

  const [cases, setCases] = useState<CaseDetails[]>([]);
  const { setLoading } = useLoading();
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setLoading(true);
    getAllCases()
      .then((resp) => setCases(resp?.data))
      .catch((err: any) => console.error("Error fetching cases:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(cases.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFirms = cases.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  return (
    <div>
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
                className={idx % 2 === 1 ? "bg-gray-200 dark:bg-gray-900" : ""}
              >
                <TableCell>#{Case.CaseNo}</TableCell>
                <TableCell>{Case?.vehicleDetail?.vehicleNo}</TableCell>
                <TableCell>
                  {Case.createdBy.firstName} {Case.createdBy.lastName} |{" "}
                  {Case.createdBy.employeeCode}
                </TableCell>
                <TableCell>{Case.status}</TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/superadmin/cases/${Case.CaseNo}`, {
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

      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <button
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