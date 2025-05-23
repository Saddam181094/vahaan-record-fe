import { set, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState,useEffect } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";

import { createBranch, getBranch, toggleBranch } from "@/service/branch.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "./ui/button";
import { Input } from "./ui/input";
// import { Toaster } from "@/components/ui/sonner";

export interface Branch {
  branchCode?: string;
  id?: string;
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

export default function AdminBranchForm() {
    const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Branch>({ defaultValues: {} as Branch });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

 useEffect(() => {
    setLoading(true);
    getBranch()
      .then((branches) => {
      setBranches(branches);
      })
      .catch((err:any) => {
      console.error("Error fetching branches:", err);
      })
      .finally(() => setLoading(false));
  }, [refreshFlag]);

  const onSubmit: SubmitHandler<Branch> = async (data: Branch) => {
    setLoading(true);
    try {
      const newBranch = await createBranch(data);
      setBranches([...branches, newBranch]);
      setDialogOpen(false);
      setRefreshFlag((prev) => !prev); // Trigger a refresh
      reset(); // Reset the form after successful submission
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (branch: Branch) => {
    try {
      const isActive = await toggleBranch(branch.id!);
      setBranches((prev) =>
        prev.map((b) => (b.id === branch.id ? { ...b, isActive } : b))
      );
      console.log("Branch toggled successfully");
    } catch (err: any) {
        console.error(err);
    }
  };

  return (
    <div>
      <Button onClick={() => setDialogOpen(true)} className="mb-4">
      Add Branch
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
        <DialogTitle>Add New Branch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
        {["name", "address1", "address2", "city", "state", "pincode"].map((field) => (
          <div key={field}>
          <Input
            {...register(field as keyof Branch, { required: true })}
            placeholder={field[0].toUpperCase() + field.slice(1)}
          />
          {errors[field as keyof Branch] && (
            <p className="text-red-600 text-sm">{field} is required</p>
          )}
          </div>
        ))}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
          Cancel
          </Button>
          <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Branch"}
          </Button>
        </div>
        </form>
      </DialogContent>
      </Dialog>

      <Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Address</TableHead>
      <TableHead>Pincode</TableHead>
      <TableHead>Created</TableHead>
      <TableHead>Updated</TableHead>
      <TableHead>Active</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {branches.length === 0 ? (
      <TableRow>
        <TableCell colSpan={6} className="text-center py-4">
          No branches found.
        </TableCell>
      </TableRow>
    ) : (
      branches.map((branch) => (
        <TableRow key={branch.branchCode}>
          <TableCell>{branch.name}</TableCell>
          <TableCell>
            {branch.address1}, {branch.address2}, {branch.city}, {branch.state}
          </TableCell>
          <TableCell>{branch.pincode}</TableCell>
          <TableCell>{branch.createdAt}</TableCell>
          <TableCell>{branch.updatedAt}</TableCell>
          <TableCell>
            <Switch
              checked={!!branch.isActive}
              onCheckedChange={() => handleToggle(branch)}
            />
          </TableCell>
        </TableRow>
      ))
    )}
  </TableBody>
</Table>

    </div>
  );
}
