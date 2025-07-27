import EmployeeForm from "@/components/EmployeeForm";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const AddBranch = () => {

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white pr-6 lg:py-20 min-h-screen">
          <div className="flex justify-end mb-4">
          </div>
          <div className="flex flex-col w-full h-full min-h-screen ml-3">
            <EmployeeForm />
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default AddBranch;