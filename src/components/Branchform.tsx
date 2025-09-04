import { Controller, useForm } from "react-hook-form";
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
  updateBranch,
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
import { useAuth } from "@/context/AuthContext";
import { PenIcon } from "lucide-react";

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
    control,
    setValue,
    formState: { errors },
  } = useForm<Branch>({ defaultValues: {} as Branch });

  const [branches, setBranches] = useState<Branch[]>([]);
  const { setLoading } = useLoading();
  const [formLoading, setFormLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogOpen2, setDialogOpen2] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const toast = useToast();
  const [search , setSearch]= useState("");
  const {logout } = useAuth();

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
           if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }

       else { toast.showToast('Error:', err?.message || 'Some Error in Fetching Branches', 'error');}
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
      toast.showToast('Success','Branch Successfully created.','success');
      setRefreshFlag((prev) => !prev);
      reset();
    } catch (err: any) {
         if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        else
      {toast.showToast('Some Error in Fetching Branches', err, 'error');}
      // console.error(err);
    } finally {
      
      setFormLoading(false);
    }
  };

  const onSubmit2:SubmitHandler<Branch> = async (data) => {
              setFormLoading(true);
              if(!editBranch || !editBranch.branchCode) {
                toast.showToast('Error', 'No branch selected for update', 'error');
                setFormLoading(false);
                return;
              }
              try {
                // Assuming updateBranch is available in branch.service
                await updateBranch(editBranch.branchCode, data);
                toast.showToast('Success', 'Branch updated successfully.', 'success');
                setRefreshFlag((prev) => !prev);
                setDialogOpen2(false);
                reset();
              } catch (err: any) {
                if (err?.status == 401 || err?.response?.status == 401) {
                  toast.showToast('Error', 'Session Expired', 'error');
                  logout();
                } else {
                  toast.showToast('Error:', err?.message || 'Error updating branch', 'error');
                }
              } finally {
                setFormLoading(false);
              }
            }

  const handleDiagClick = () => {
    setDialogOpen(false);
    reset();
  };


  const handleToggle = async (branch: string) => {
    setLoading(true);
    try {
      await toggleBranch(branch);
      toast.showToast('Success','Branch Switched Succesfully', 'success');
    } catch (err: any) {
         if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        else
{      
  toast.showToast('Error:', err?.message || 'Some Error in switching Branches', 'error');
}      // console.error(err);
    } finally {
      setRefreshFlag((prev) => !prev);
      setLoading(false);
    }
  };


  return (
    <div>
      <Button 
      style={{cursor:"pointer"}}
      onClick={() => {
        reset({
          name: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          pincode: '',
          
        })
        setDialogOpen(true)}} className="mb-4 bg-[#5156DB]">
        Add Branch
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Branch</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="sp</form>ace-y-4 mb-6">
            {["name", "address1", "address2", "city", "pincode"].map((field) => (
              <div key={field}>
                <Input
                  {...register(field as keyof Branch, {
                    required: true,
                    ...(field === "pincode"
                      ? {
                          pattern: {
                            value: /^[1-9][0-9]{5}$/,
                            message: "Enter a valid 6-digit Indian pincode",
                          },
                        }
                      : {}),
                  })}
                  placeholder={field[0].toUpperCase() + field.slice(1)}
                  type={field === "pincode" ? "tel" : "text"}
                  maxLength={field === "pincode" ? 6 : undefined}
                  inputMode={field === "pincode" ? "numeric" : undefined}
                />
                {errors[field as keyof Branch] && (
                  <p className="text-red-600 text-sm">
                    {errors[field as keyof Branch]?.message ||
                      `${field.toUpperCase()} is required`}
                  </p>
                )}
              </div>
            ))}
<div>
  <Controller
    name="state"
    control={control}
    rules={{ required: "State is required" }}
    render={({ field, fieldState }) => (
      <>
        <Select
          value={field.value}
          onValueChange={(value) => {
            setValue("state",value);
            setSearch('');
            }}
          
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
                onClick={(e) => e.stopPropagation()} 
                onKeyDown={(e) => e.stopPropagation()} 
              />
            </div>
            {ind2.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
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

      <Dialog open={dialogOpen2} onOpenChange={() => setDialogOpen2(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Branch</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit2)}
            className="space-y-4 mb-6"
          >
            {["name", "address1", "address2", "city", "pincode"].map((field) => (
              <div key={field}>
                <Input
                  {...register(field as keyof Branch, {
                    required: true,
                    ...(field === "pincode"
                      ? {
                          pattern: {
                            value: /^[1-9][0-9]{5}$/,
                            message: "Enter a valid 6-digit Indian pincode",
                          },
                        }
                      : {}),
                  })}
                  placeholder={field[0].toUpperCase() + field.slice(1)}
                  type={field === "pincode" ? "tel" : "text"}
                  maxLength={field === "pincode" ? 6 : undefined}
                  inputMode={field === "pincode" ? "numeric" : undefined}
                />
                {errors[field as keyof Branch] && (
                  <p className="text-red-600 text-sm">
                    {errors[field as keyof Branch]?.message ||
                      `${field.toUpperCase()} is required`}
                  </p>
                )}
              </div>
            ))}
            <div>
              <Controller
                name="state"
                control={control}
                rules={{ required: "State is required" }}
                render={({ field, fieldState }) => (
                  <>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        setValue("state", value);
                        setSearch('');
                      }}
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
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                          />
                        </div>
                        {ind2.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
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
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" className="cursor-pointer" onClick={() => setDialogOpen2(false)}>
                Cancel
              </Button>
              <Button type="submit"  className="cursor-pointer" disabled={formLoading}>
                {formLoading ? "Updating..." : "Update Branch"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <DataTable columns={[...branchTableColumns,
        {
                            header: 'Actions',
                            cell: ({ row }) => (
                            <>
                  <div className="flex gap-2 items-center">
                            <Switch
                    checked={!!row.original.isActive}
                    onCheckedChange={() =>
                      handleToggle(row.original?.branchCode ?? "")
                    }
                  />
      <Button
        variant="default"
        className="cursor-pointer"
        size="sm"
        onClick={() => {
          setEditBranch(row.original);
          reset({
            name: row.original.name,
            address1: row.original.address1,
            address2: row.original.address2,
            state: row.original.state,
            pincode: row.original.pincode,
            city: row.original.city,
          });
          setDialogOpen2(true);
        }}
      >
        <PenIcon/>
      </Button>
      </div>
      </>
                  )
                        }
      ]} data={branches} />
    </div>
  );
}
