import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createFirm, toggleFirm, getFirm } from "@/service/firm.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLoading } from "./LoadingContext";
import { useToast } from "@/context/ToastContext";
import { DataTable } from "./DataTable";
import { firmTableColumns } from "@/lib/tables.data";
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
const {setLoading} = useLoading();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    getFirm()
      .then((resp) => {
        setfirms(resp?.data);
      })
      .catch((err: any) => {
      toast.showToast('Error fetching:',err,'error');
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
      toast.showToast('Affirmation:','Successfully created a Firm','success');
      reset(); // Reset the form after successful submission
    } catch (err: any) {
     toast.showToast('Error fetching:',err,'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (Firm: string) => {
    setLoading(true);
    try {
      console.log("Toggling Firm:", Firm);
      await toggleFirm(Firm);
      console.log("Firm toggled successfully");
    } catch (err: any) {
      console.error(err);
    } finally {
      setRefreshFlag((prev) => !prev); // Trigger a refresh
      setLoading(false);
    }
  };
    const handleDiagClick = () => {
    setDialogOpen(false);
    reset(); // Reset the form when dialog is closed
  }


  return (
    <div>
      <Button style={{cursor:"pointer"}} onClick={() => setDialogOpen(true)} className="mb-4">
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
              <Button
              style={{cursor:"pointer"}}
                type="button"
                variant="outline"
                onClick={handleDiagClick}
              >
                Cancel
              </Button>
              <Button style={{cursor:"pointer"}} type="submit">
               Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

          <DataTable columns={[...firmTableColumns,
             {
    id: "isActive",
    header: "Active",
    cell: ({ row }) => {
      const firm = row.original;
      return (
        <Switch
          checked={!!firm.isActive}
          onCheckedChange={() => handleToggle(firm.id)}
        />
      );
    },
  },
          ]} data={firms} />
    </div>
  );
}
