import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import RTOComp from "@/components/RTOComp";

const AddRTO = () => {

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh]">
          <div className="flex flex-col w-full h-full min-h-screen ml-3">
            <RTOComp/>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default AddRTO;