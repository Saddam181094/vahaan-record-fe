import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "./ui/label";
import { Controller, useForm } from "react-hook-form";
import { Select, SelectTrigger } from "@radix-ui/react-select";
import { SelectContent, SelectItem, SelectValue } from "./ui/select";
import { useLoading } from "./LoadingContext";
import { useToast } from "@/context/ToastContext";
import { CaseFilterType } from "./CaseDesAll";

const ClientBills = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
  };
    const { handleSubmit, setValue, getValues, control, watch } = useForm<any>({
      defaultValues: {
    filterType: "applicationDate",
    fromDate: "",
    toDate: "",
  },
    });
  const toast = useToast();

  const [filteredCases, setFilteredCases] = useState<any[]>([]);
  const {setLoading} = useLoading();

  const applyFilter = async (data: any) => {
    const { fromDate, toDate, filterType } = data;
  
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
  const selectedFilterType = watch("filterType");


  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white pr-6 py-4 h-full min-h-[100vh]">
          <div className="flex justify-end mb-4">
            <Button style={{cursor:"pointer"}} variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={() => setOpen(true)}>
              Logout
            </Button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Logout</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to logout?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-2">
                  <Button style={{cursor:"pointer"}} variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button style={{cursor:"pointer"}} variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
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
              <Select key={selectedFilterType} onValueChange={field.onChange} value={selectedFilterType}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Select Filter" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CaseFilterType).map(([key, value]) => (
                    <SelectItem key={key} value={value}>
                      {key
                        .replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/(^|\s)\S/g, (l: string) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
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