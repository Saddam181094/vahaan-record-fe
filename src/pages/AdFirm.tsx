import FirmForm from "@/components/FirmForm";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const AddFirm = () => {


  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh] ms-3">
          <div className="flex flex-col w-full h-full min-h-screen overflow-y-auto">
            <FirmForm />
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default AddFirm;