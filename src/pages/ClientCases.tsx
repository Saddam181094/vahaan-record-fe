import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import ClientPortal from "@/components/ClientPortal";

const Client = () => {
  // const [open, setOpen] = useState(false);
  // const { logout } = useAuth();
  // const handleLogout = () => {
  //   logout();
  // };

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh]">
          {/* <div className="flex justify-end mb-4">
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
          </div> */}
          <div className="flex flex-col w-full ml-3">
            <ClientPortal/>
                         <footer className="w-full mt-85 py-4 bg-gray-100 border-t text-center text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
                <span>
                  <strong>Customer Care:</strong> 7801878800
                </span>
                <span className="hidden md:inline mx-2">|</span>
                <span>
                  <strong>Mail:</strong> info@vahaanrecord.com
                </span>
                <span className="hidden md:inline mx-2">|</span>
                <span>
                  Contact us For any Query or help
                </span>
              </footer>
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default Client;
