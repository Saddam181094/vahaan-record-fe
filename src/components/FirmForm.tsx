import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createFirm, toggleFirm, getFirm, updateFirm } from "@/service/firm.service";
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
import { useAuth } from "@/context/AuthContext";
import { PenIcon } from "lucide-react";
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
  const [dialogOpen2, setDialogOpen2] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const toast = useToast();
  const {logout} =useAuth();

  useEffect(() => {
    setLoading(true);
    getFirm()
      .then((resp) => {
        setfirms(resp?.data);
      })
      .catch((err: any) => {
                if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }else
{        toast.showToast('Error:',err?.message || 'Error during fetch of Firms','error');
}
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
      toast.showToast('Success:','Successfully created a Firm','success');
      reset(); // Reset the form after successful submission
    } catch (err: any) {
              if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }else
{        toast.showToast('Error:',err?.message || 'Error during Creation of Firm','error');
}
    } finally {
      setLoading(false);
    }
  };

  const onSubmit2:SubmitHandler<Firm> =  async (data) => {
              setLoading(true);
              try {
                // Assuming you have an updateFirm service
                await updateFirm(data);
                toast.showToast('Success:', 'Firm updated successfully', 'success');
                setRefreshFlag((prev) => !prev);
                setDialogOpen2(false);
                reset();
              } catch (err: any) {
                if (err?.status == 401 || err?.response?.status == 401) {
                  toast.showToast('Error', 'Session Expired', 'error');
                  logout();
                } else {
                  toast.showToast('Error:', err?.message || 'Error during update', 'error');
                }
              } finally {
                setLoading(false);
              }
            }

  const handleToggle = async (Firm: string) => {
    setLoading(true);
    try {
      await toggleFirm(Firm);
      toast.showToast('Success:','Firm Switched Successfully','info');
    } catch (err: any) {
              if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }else
{      toast.showToast('Error:',err || 'Error occured in Flipping','error');
}    } finally {
      setRefreshFlag((prev) => !prev); // Trigger a refresh
      setLoading(false);
    }
  };
    const handleDiagClick = () => {
    setDialogOpen(false);
    reset(); // Reset the form when dialog is closed
  }
  const handleDiagClick2 = () => {
    setDialogOpen2(false);
    reset();
  }

  return (
    <div>
      <Button style={{cursor:"pointer"}} onClick={() => {
        reset({name:""} as Firm);
        setDialogOpen(true)}} className="mb-4 bg-[#5156DB]">
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

      <Dialog open={dialogOpen2} onOpenChange={() => setDialogOpen2(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Firm</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(onSubmit2)}
            className="space-y-4 mb-6"
          >
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
                style={{ cursor: "pointer" }}
                type="button"
                variant="outline"
                onClick={() => handleDiagClick2()}
              >
                Cancel
              </Button>
              <Button style={{ cursor: "pointer" }} type="submit">
                Save
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
  {
    header: "Actions",
    cell: ({ row }) => {
      const firm = row.original;
      return ( 
        <Button
          style={{ cursor: "pointer" }}
          variant="outline"
          onClick={() => {
            reset(firm); // Populate form with selected firm's data
            setDialogOpen2(true); // Open the edit dialog
          }}
        >
          <PenIcon/>
        </Button>
      );    
  }
  }
          ]} data={firms} />
    </div>
  );
}
