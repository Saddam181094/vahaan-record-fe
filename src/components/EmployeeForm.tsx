import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEmployee, getEmployee } from "@/service/emp.service";
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
import { useLoading } from "./LoadingContext";
import { Label } from "@radix-ui/react-label";
import { useToast } from "@/context/ToastContext";
// import { Toaster } from "@/components/ui/sonner";

export interface Employee {
  id?: string;
  branchCode?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNo: string;
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
  const [Employee2, setEmployee2] = useState<Employee[]>([]);
  const [branch, setBranch] = useState<Branch[]>([]);
  const {setLoading} = useLoading();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [search,setSearch] = useState("");
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    getEmployee()
      .then((resp) => {
        setEmployee2(resp?.data);
      })
      .catch((err: any) => {
        toast.showToast('Error fetching:',err,'error');
      }).finally(()=> setLoading(false));

  }, [refreshFlag]);

  useEffect(()=>{
    setLoading(true);
    getActiveBranch()
      .then((resp) => {
        setBranch(resp?.data);
      })
      .catch((err: any) => {
        toast.showToast('Error fetching:',err,'error');
      })
      .finally(() => setLoading(false));
  },[refreshFlag])

  const onSubmit: SubmitHandler<Employee> = async (data: Employee) => {
    setLoading(true);
    try {
      const newEmployee = await createEmployee(data);
      setEmployee([...Employee, newEmployee]);
      setDialogOpen(false);
      setRefreshFlag((prev) => !prev); // Trigger a refresh
      toast.showToast('Affirmation','Created a New Employee','success');
      reset(); // Reset the form after successful submission
    } catch (err: any) {
        toast.showToast('Error fetching:',err,'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDiagClick = () => {
    setDialogOpen(false);
    reset(); // Reset the form when dialog is closed
  };

const [currentPage, setCurrentPage] = useState(1);
  const [items, setItemsper] = useState("10"); // Default to 10 entries
  const items_per_page = parseInt(items, 10);

  const isEntryLimitValid = items_per_page >= 1 && items_per_page <= 20;
  const ITEMS_PER_PAGE = items_per_page;
  const totalPages = isEntryLimitValid
    ? Math.ceil(Employee2.length / ITEMS_PER_PAGE)
    : 1;

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedEmployee = isEntryLimitValid
    ? Employee2.slice(startIdx, startIdx + ITEMS_PER_PAGE)
    : [];


  useEffect(() => {
    setCurrentPage(1); // Reset to first page when limit changes
  }, [items_per_page]);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));


  return (
    <div>
      <Button style={{cursor:"pointer"}} onClick={() => setDialogOpen(true)} className="mb-4">
        Add Employee
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Employee</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
            {["firstname", "lastname", "email", "role", "phone", "branchCode"].map((field) => (
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
                      <div className="p-2">
                    <Input
                      placeholder="Search a Branch"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
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
              <Button style={{cursor:"pointer"}} type="button" variant="outline" onClick={handleDiagClick}>
                Cancel
              </Button>
              <Button style={{cursor:"pointer"}} type="submit">
                Create Employee
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone No.</TableHead>
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
                <TableCell>{Employee.firstName} {Employee.lastName}</TableCell>
                <TableCell>
                  {Employee.email}
                </TableCell>
                <TableCell>
                  {Employee.phoneNo}
                </TableCell>
                <TableCell>
                  {Employee.branchCode}
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
