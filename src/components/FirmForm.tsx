import {useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState,useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { createFirm,toggleFirm,getFirm } from "@/service/firm.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
// import { Toaster } from "@/components/ui/sonner";

export interface Firm {
  name: string;
  id: string;
  isActive?: boolean;
}

export default function AdminFirmForm() {
    const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Firm>({ defaultValues: {} as Firm });

  const [firms, setfirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

 useEffect(() => {
    setLoading(true);
    getFirm()
      .then((resp) => {
      setfirms(resp?.data);
      })
      .catch((err:any) => {
      console.error("Error fetching firms:", err);
      })
      .finally(() => setLoading(false));
  }, [refreshFlag]);

  const onSubmit: SubmitHandler<Firm> = async (data: Firm) => {
    setLoading(true);
    try {
      const newFirm = await createFirm(data);
      setfirms([...firms, newFirm]);
      setDialogOpen(false);
      setRefreshFlag((prev) => !prev); // Trigger a refresh
      reset(); // Reset the form after successful submission
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (Firm: string) => {
    try {
      console.log("Toggling Firm:", Firm);
      await toggleFirm(Firm);
      console.log("Firm toggled successfully");
    } catch (err: any) {
        console.error(err);
    }finally{
      setRefreshFlag((prev) => !prev); // Trigger a refresh
    }
  };

  return (
    <div>
      <Button onClick={() => setDialogOpen(true)} className="mb-4">
      Add Firm
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent>
        <DialogHeader>
        <DialogTitle>Add New Firm</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
        {["name"].map((field) => (
          <div key={field}>
          <Input
            {...register(field as keyof Firm, { required: true })}
            placeholder={field[0].toUpperCase() + field.slice(1)}
          />
          {errors[field as keyof Firm] && (
            <p className="text-red-600 text-sm">{field} is required</p>
          )}
          </div>
        ))}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
          Cancel
          </Button>
          <Button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Firm"}
          </Button>
        </div>
        </form>
      </DialogContent>
      </Dialog>

      <Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Firm ID</TableHead>
      <TableHead>Active</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {firms.length === 0 ? (
      <TableRow>
        <TableCell colSpan={6} className="text-center py-4">
          No Firm found.
        </TableCell>
      </TableRow>
    ) : (
      firms.map((Firm) => (
        <TableRow>
          <TableCell>{Firm.name}</TableCell>
          <TableCell>{Firm.id}</TableCell>
          <TableCell>
            <Switch
              checked={!!Firm.isActive}
              onCheckedChange={() => handleToggle(Firm?.id?? "")}
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
