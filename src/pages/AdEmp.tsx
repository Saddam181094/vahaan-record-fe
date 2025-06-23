import EmployeeForm from "@/components/EmployeeForm";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

const AddBranch = () => {

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white pr-6 lg:py-20 min-h-screen ms-3">
          <div className="flex justify-end mb-4">
            {/*             {/* <Button style={{cursor:"pointer"}} variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={() => setOpen(true)}>
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
            </Dialog> */}
          </div>
          <div className="flex flex-col w-full h-full min-h-screen overflow-y-auto">
            <EmployeeForm />
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default AddBranch;