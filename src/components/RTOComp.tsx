import { Controller, useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useLoading } from "@/components/LoadingContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/context/ToastContext";
import { DataTable } from "./DataTable";
import { rtoTableColumns } from "@/lib/tables.data";
import { useAuth } from "@/context/AuthContext";
import { createRto, getAllRto, toggleRto, updateRto } from "@/service/rto.service";

export interface RTO {
  id:string;
  rtoCode:string;
  city:string;
  isActive:boolean;
}

export default function AdminBranchForm() {
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RTO>({ defaultValues: { rtoCode: "",
      city: "",} as RTO });

  const [rtos, setRtos] = useState<RTO[]>([]);
  const { setLoading } = useLoading();
  const [formLoading, setFormLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [editRto, setEditRto] = useState<RTO | null>(null);
  const toast = useToast();
  // const [search , setSearch]= useState("");
  const {logout } = useAuth();
  

  useEffect(() => {
    setLoading(true);
    getAllRto()
      .then((resp) => {
        setRtos(resp?.data);
      })
      .catch((err: any) => {
           if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }

       else { toast.showToast('Error:', err?.message || 'Some Error in Fetching rtos', 'error');}
        // console.error("Error fetching rtos:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [refreshFlag]);

const onSubmit: SubmitHandler<RTO> = async (data: RTO) => {
  setFormLoading(true);
  try {
    if (editRto) {
      await updateRto(editRto.id, data.rtoCode, data.city);
      toast.showToast('Success', 'RTO successfully updated.', 'success');
    } else {
      const newBranch = await createRto(data.rtoCode, data.city);
      setRtos([...rtos, newBranch]);
      toast.showToast('Success', 'RTO successfully created.', 'success');
    }
    setDialogOpen(false);
    setRefreshFlag((prev) => !prev);
    reset();
    setEditRto(null);
  } catch (err: any) {
    if (err?.status == 401 || err?.response?.status == 401) {
      toast.showToast('Error', 'Session Expired', 'error');
      logout();
    } else {
      toast.showToast('Error:', err?.message || 'Some error occurred.', 'error');
    }
  } finally {
    setFormLoading(false);
  }
};



  const handleDiagClick = () => {
    setEditRto(null);
    setDialogOpen(false);
    reset();
  };

  const handleToggle = async (RTO: string) => {
    setLoading(true);
    try {
      await toggleRto(RTO);
      toast.showToast('Success','RTO Switched Succesfully', 'success');
    } catch (err: any) {
         if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        else
{      
  toast.showToast('Error:', err?.message || 'Some Error in switching rtos', 'error');
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
        reset({ rtoCode: "", city: "" }); // 👈 clear edit state
        setDialogOpen(true)}} className="mb-4 bg-[#5156DB]">
        Add RTO
      </Button>

      <Dialog open={dialogOpen} onOpenChange={(vale)=>{
          if (!vale) {
    setEditRto(null); // 👈 ensure edit state is cleared on dialog close
    reset();
  } 
  setDialogOpen(vale);
      }}>
        <DialogContent>
<DialogHeader>
  <DialogTitle>{editRto ? "Update RTO" : "Add New RTO"}</DialogTitle>
</DialogHeader>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6"> 
      {/* RTO Code */}
      <div>
        <Controller
          name="rtoCode"
          control={control}
          rules={{ required: "RTO Code is required" }}
          render={({ field }) => (
            <Input id="rtoCode" 
             value={field.value?.toUpperCase() ?? ""}
             onChange={e => field.onChange(e.target.value.toUpperCase())} 
             placeholder="RTO Code" />
          )}
        />
        {errors.rtoCode && (
          <p className="text-red-600 text-sm">{errors.rtoCode.message}</p>
        )}
      </div>

      {/* City */}
      <div>
        <Controller
          name="city"
          control={control}
          rules={{ required: "City is required" }}
          render={({ field }) => (
            <Input id="city" 
            value={field.value?.toUpperCase() ?? ""}
             onChange={e => field.onChange(e.target.value.toUpperCase())}  
             placeholder="City" />
          )}
        />
        {errors.city && (
          <p className="text-red-600 text-sm">{errors.city.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleDiagClick} style={{ cursor: "pointer" }}>
          Cancel
        </Button>
<Button type="submit" disabled={formLoading} style={{ cursor: "pointer" }}>
  {formLoading ? (editRto ? "Updating..." : "Creating...") : (editRto ? "Update RTO" : "Create RTO")}
</Button>

      </div>
    </form>

        </DialogContent>
      </Dialog>

      <DataTable columns={[...rtoTableColumns,

{
  header: 'Actions',
  cell: ({ row }) => (
    <div className="flex gap-2 items-center">
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setEditRto(row.original);
          reset({
            rtoCode: row.original.rtoCode,
            city: row.original.city,
          });
          setDialogOpen(true);
        }}
      >
        Update
      </Button>
      </div>
  )
  },
  {
     header: 'Actions',
      cell: ({ row }) => (
      <Switch
        className="cursor-pointer"
        checked={!!row.original.isActive}
        onCheckedChange={() => handleToggle(row.original?.id ?? "")}
      />
  ),
}

      ]} data={rtos} />
    </div>
  );
}
