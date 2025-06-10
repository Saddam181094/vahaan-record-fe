import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createEmployee, getEmployee } from "@/service/emp.service";
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
import { useToast } from "@/context/ToastContext";
import { DataTable } from "./DataTable";
import { employeeTableColumns } from "@/lib/tables.data";
// import { useAuth } from "@/context/AuthContext";
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
    control,
    formState: { errors },
  } = useForm<Employee>({ defaultValues: {} as Employee });

  const [Employee, setEmployee] = useState<Employee[]>([]);
  const [Employee2, setEmployee2] = useState<Employee[]>([]);
  const [branch, setBranch] = useState<Branch[]>([]);
  const { setLoading } = useLoading();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [search, setSearch] = useState("");
  const toast = useToast();
  // const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    getEmployee()
      .then((resp) => {
        setEmployee2(resp?.data);
      })
      .catch((err: any) => {
        toast.showToast('Error fetching:', err, 'error');
      }).finally(() => setLoading(false));

  }, [refreshFlag]);

  useEffect(() => {
    setLoading(true);
    getActiveBranch()
      .then((resp) => {
        setBranch(resp?.data);
      })
      .catch((err: any) => {
        toast.showToast('Error fetching:', err, 'error');
      })
      .finally(() => setLoading(false));
  }, [refreshFlag])

  const onSubmit: SubmitHandler<Employee> = async (data: Employee) => {
    setLoading(true);
    try {
      const newEmployee = await createEmployee(data);
      setEmployee([...Employee, newEmployee]);
      setDialogOpen(false);
      setRefreshFlag((prev) => !prev); // Trigger a refresh
      toast.showToast('Affirmation', 'Created a New Employee', 'success');
      reset(); // Reset the form after successful submission
    } catch (err: any) {
      toast.showToast('Error fetching:', err, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDiagClick = () => {
    setDialogOpen(false);
    reset(); // Reset the form when dialog is closed
  };


  return (
    <div>
      <Button style={{ cursor: "pointer" }} onClick={() => setDialogOpen(true)} className="mb-4 bg-[#584FF7]">
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
        <Controller
          name="branchCode"
          control={control}
          rules={{ required: "Branch is required" }}
          render={({ field: branchField, fieldState }) => (
            <>
              <Select
                value={branchField.value}
                onValueChange={(value) => branchField.onChange(value)}
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
              {fieldState.error && (
                <p className="text-red-600 text-sm">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      ) : field === "role" ? (
        <Controller
          name="role"
          control={control}
          rules={{ required: "Role is required" }}
          render={({ field: roleField, fieldState }) => (
            <>
              <Select
                value={roleField.value}
                onValueChange={(value) => roleField.onChange(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a Role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(UserRole).map(
                    (role) =>
                      !["superadmin", "client"].includes(role) && (
                        <SelectItem key={role} value={role}>
                          {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                      )
                  )}
                </SelectContent>
              </Select>
              {fieldState.error && (
                <p className="text-red-600 text-sm">{fieldState.error.message}</p>
              )}
            </>
          )}
        />
      ) : (
        <>
          <Input
            {...register(field as keyof Employee, { required: true })}
            placeholder={field[0].toUpperCase() + field.slice(1)}
          />
          {errors[field as keyof Employee] && (
            <p className="text-red-600 text-sm">{field} is required</p>
          )}
        </>
      )}
    </div>
  ))}

            <div className="flex justify-end gap-2">
              <Button style={{ cursor: "pointer" }} type="button" variant="outline" onClick={handleDiagClick}>
                Cancel
              </Button>
              <Button style={{ cursor: "pointer" }} type="submit">
                Create Employee
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DataTable columns={[...employeeTableColumns
      ]} data={Employee2} />
    </div>
  );
}
