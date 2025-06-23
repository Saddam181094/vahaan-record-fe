import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Controller, useForm } from "react-hook-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useLoading } from "./LoadingContext";
import { useToast } from "@/context/ToastContext";
import { useEffect, useState } from "react";
import { billbyId, getBills } from "@/service/bills.service";
import { useAuth } from "@/context/AuthContext";
import { DataTable } from "./DataTable";
import { paymentColumns } from "@/lib/tables.data";
import { type Payment } from "@/lib/tables.data";
// import { useState } from "react";

export interface Bill{
     billId: string,
     billMonth: string,
     billYear:string,
     billAmount:string,
     BillDate:string,
     Duedate:string,
}

const ClientBills = () => {
  const { handleSubmit, control} = useForm<{ filterType: string }>({
    defaultValues: {
      filterType: "",
    },
  });

  const toast = useToast();
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [bdata,setBdata] = useState<Payment[]>([]);
  const { setLoading } = useLoading();

  useEffect(() => {
    setLoading(true);
    getBills(user?.id)
      .then((resp) => {
        setBills(resp?.data ?? []);
        toast.showToast('Success','All Bills Fetched','success');
      })
      .catch((err: any) => {
        toast.showToast("Error", err?.message || "Fetching error", "error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const applyFilter = async (data: { filterType: string }) => {
    const { filterType } = data;

    if (!filterType) return;

    setLoading(true);
    try {
      // Replace with your API function
     const resp = await billbyId(filterType);
     setBdata(resp?.data?.payments);
      toast.showToast('Success',resp?.message,'success');
    } catch (err) {
      toast.showToast("Error", "Failed to apply filter", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh]">
        <form
          onSubmit={handleSubmit(applyFilter)}
          className="flex flex-wrap gap-4 items-end md:flex-nowrap p-4"
        >
          {/* Filter Type Dropdown */}
          <div className="flex flex-col space-y-1 min-w-[200px] flex-1">
            <Label className="text-sm font-medium">
              Filter Type <span className="text-red-500">*</span>
            </Label>
            <Controller
              name="filterType"
              control={control}
              rules={{
                required:true
              }}
              render={({ field, fieldState }) => (
                <>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Bill" />
                    </SelectTrigger>
                    <SelectContent>
                      {bills.map((bill) => (
                        <SelectItem key={bill.billId} value={bill.billId}>
                          {bill.billMonth}-{bill.billYear}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <span className="text-xs text-red-500">{fieldState.error.message || "This field is required"}</span>
                  )}
                </>
              )}
            />
          </div>

          <div className="w-full md:w-auto">
            <Button type="submit" className="mt-2 w-full md:w-auto">
              Filter
            </Button>
          </div>
        </form>

        <DataTable 
        data={bdata}
        columns= {[...paymentColumns]}
        />
      </div>
    </SidebarProvider>
  );
};

export default ClientBills;