import CaseDesAll from "@/components/CaseDesAll"
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const Allcases = () => {

  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh]">
          <div className="flex flex-col w-full h-full min-h-screen ml-3">
            <CaseDesAll />
          </div>
        </div>
      </SidebarProvider>
  );
};

export default Allcases;