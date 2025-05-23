import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEmployee } from "@/service/emp.service";
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
// import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import Loader from "@/components/Loader";
import {
  getActiveBranch
} from "@/service/branch.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Branch } from "./Branchform";
import { UserRole } from "@/context/AuthContext";
// import { Toaster } from "@/components/ui/sonner";

export interface Employee {
  branchCode?: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: string;
}

export default function EmployeeForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Employee>({ defaultValues: {} as Employee });

  const [Employee, setEmployee] = useState<Employee[]>([]);
  const [branch, setBranch] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    setLoading(true);
    getActiveBranch()
      .then((resp) => {
        setBranch(resp?.data);
      })
      .catch((err: any) => {
        console.error("Error fetching branches:", err);
      })
      .finally(() => setLoading(false));
  }, [refreshFlag]);

  const onSubmit: SubmitHandler<Employee> = async (data: Employee) => {
    setLoading(true);
    try {
      const newEmployee = await createEmployee(data);
      setEmployee([...Employee, newEmployee]);
      setDialogOpen(false);
      setRefreshFlag((prev) => !prev); // Trigger a refresh
      reset(); // Reset the form after successful submission
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDiagClick = () => {
    setDialogOpen(false);
    reset(); // Reset the form when dialog is closed
  };

//   const handleToggle = async (branch: string) => {
//     setLoading2(true);
//     try {

//     } catch (err: any) {
//       console.error(err);
//     } finally {
//       setRefreshFlag((prev) => !prev); // Trigger a refresh
//       setLoading2(false);
//     }
//   };

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const totalPages = Math.ceil(Employee.length / ITEMS_PER_PAGE);
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployee = Employee.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div>
      <Button onClick={() => setDialogOpen(true)} className="mb-4">
        Add Employee
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>

<form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
  {["firstname","lastname","email","role","phone","branchCode" ].map((field) => (
    <div key={field}>
      {field === "branchCode" ? (
        <Select
          onValueChange={(value) => setValue("branchCode", value)}
          defaultValue={watch("branchCode")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Branch" />
          </SelectTrigger>
          <SelectContent>
            {branch.map((resp) => (
              <SelectItem key={resp?.branchCode ?? ""} value={resp?.branchCode ?? ""}>
                {resp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : field === "role" ? (
        <Select
          onValueChange={(value) => setValue("role", value)}
          defaultValue={watch("role")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Role" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(UserRole).map((role) => (
              <SelectItem key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          {...register(field as keyof Employee, { required: true })}
          placeholder={field[0].toUpperCase() + field.slice(1)}
        />
      )}
      {errors[field as keyof Employee] && (
        <p className="text-red-600 text-sm">{field} is required</p>
      )}
    </div>
              )
            )}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleDiagClick}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {loading2 && (
        <div>
          <Loader isLoading/>
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone No.</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>BranchCode</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedEmployee.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No Employee found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedEmployee.map((Employee) => (
              <TableRow key={Employee.branchCode}>
                <TableCell>{Employee.firstname},{Employee.lastname}</TableCell>
                <TableCell>
                  {Employee.email}
                </TableCell>
                <TableCell>
                  {Employee.phone}
                </TableCell>
                <TableCell>
                  {Employee.role}
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
