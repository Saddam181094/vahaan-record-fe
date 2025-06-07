import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useLoading } from "@/components/LoadingContext";
import {
  createBranch,
  getBranch,
  toggleBranch,
} from "@/service/branch.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/context/ToastContext";
import { DataTable } from "./DataTable";
import { branchTableColumns } from "@/lib/tables.data";

export interface Branch {
  branchCode?: string;
  id: string;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default function AdminBranchForm() {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Branch>({ defaultValues: {} as Branch });

  const [branches, setBranches] = useState<Branch[]>([]);
  const { setLoading } = useLoading();
  const [formLoading, setFormLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toast = useToast();
  const [search , setSearch]= useState("");

  const ind2 = indianStates.filter((hostel) =>
        hostel.toLowerCase().includes(search.toLowerCase())
    );

  useEffect(() => {
    setLoading(true);
    getBranch()
      .then((resp) => {
        setBranches(resp?.data);
      })
      .catch((err: any) => {
        toast.showToast('Some Error in Fetching Branches', err, 'error');
        // console.error("Error fetching branches:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshFlag]);

  const onSubmit: SubmitHandler<Branch> = async (data: Branch) => {
    setFormLoading(true);
    try {
      const newBranch = await createBranch(data);
      setBranches([...branches, newBranch]);
      setDialogOpen(false);
      toast.showToast('Affirmation','Branch Successfully created.','success');
      setRefreshFlag((prev) => !prev);
      reset();
    } catch (err: any) {
      toast.showToast('Some Error in Fetching Branches', err, 'error');
      // console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDiagClick = () => {
    setDialogOpen(false);
    reset();
  };

  const handleToggle = async (branch: string) => {
    setLoading(true);
    try {
      await toggleBranch(branch);
      toast.showToast('Affirmation','Branch Switched Succesfully', 'success');
    } catch (err: any) {
      toast.showToast('Some Error in Fetching Branches', err, 'error');
      // console.error(err);
    } finally {
      setRefreshFlag((prev) => !prev);
      setLoading(false);
    }
  };


  return (
    <div>
      <Button 
      style={{cursor:"pointer"}}
      onClick={() => setDialogOpen(true)} className="mb-4">
        Add Branch
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
            {["name", "address1", "address2", "city", "pincode"].map(
              (field) => (
                <div key={field}>
                  <Input
                    {...register(field as keyof Branch, { required: true })}
                    placeholder={field[0].toUpperCase() + field.slice(1)}
                  />
                  {errors[field as keyof Branch] && (
                    <p className="text-red-600 text-sm">{field} is required</p>
                  )}
                </div>
              )
            )}

            <div>
              <Select
                value={watch("state")}
                onValueChange={(value) => setValue("state", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a state" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search a State"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="mb-2"
                    />
                  </div>
                  {ind2.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-red-600 text-sm">State is required</p>
              )}
            </div>

            <div className="flex justify-end gap-2">
              <Button style={{cursor:"pointer"}} type="button" variant="outline" onClick={handleDiagClick}>
                Cancel
              </Button>
              <Button style={{cursor:"pointer"}} type="submit" disabled={formLoading}>
                {formLoading ? "Creating..." : "Create Branch"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DataTable columns={[...branchTableColumns,
        {
                            header: 'Actions',
                            cell: ({ row }) => (<Switch
                    checked={!!row.original.isActive}
                    onCheckedChange={() =>
                      handleToggle(row.original?.branchCode ?? "")
                    }
                  />)
                        }
      ]} data={branches} />
    </div>
  );
}
