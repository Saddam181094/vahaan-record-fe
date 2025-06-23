import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Controller, useForm } from "react-hook-form";
import { Select, SelectTrigger } from "@radix-ui/react-select";
import {  SelectValue } from "./ui/select";
import { useLoading } from "./LoadingContext";
import { useToast } from "@/context/ToastContext";
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
    const { handleSubmit, control, watch } = useForm<any>({
      defaultValues: {
  },
    });
  const toast = useToast();

  // const [filteredCases, setFilteredCases] = useState<any[]>([]);
  // const [bills,setBills] = useState<any[]>([]);
  const {setLoading} = useLoading();

  const applyFilter = async (data: any) => {
    const { fromDate, toDate } = data;
  
    if (!fromDate || !toDate) return;
  
    setLoading(true);
    try {
      // const response = await getAllCases(filterType, fromDate, toDate);
      // setFilteredCases(response?.data || []);
    } catch (err) {
      console.error("Error fetching filtered cases:", err);
      toast.showToast("Error", "Failed to apply filter", "error");
    } finally {
      setLoading(false);
    }
  };
  const selectedFilterType = watch("filtertype");


  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh]">
          <div className="flex flex-col w-full h-full min-h-screen overflow-y-auto">
      <form
        onSubmit={handleSubmit(applyFilter)}
        className="flex flex-wrap gap-4 items-end md:flex-nowrap"
      >
        {/* Filter Type */}
        <div className="flex flex-col space-y-1 min-w-[150px] flex-1">
          <Label className="text-sm font-medium">
        Filter Type<span className="text-red-500">*</span>
          </Label>
          <Controller
            control={control}
            name="filterType"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={selectedFilterType}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select Filter" />
                </SelectTrigger>
                {/* <SelectContent>
                  {Object.entries(Bill).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {key
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/(^|\s)\S/g, (l: string) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent> */}
              </Select>
            )}
          />
        </div>
        <div className="w-full md:w-auto flex-1">
          <Button type="submit" style={{cursor:"pointer"}} className="mt-2 w-full md:w-auto">
        Filter
          </Button>
        </div>
      </form>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default ClientBills;