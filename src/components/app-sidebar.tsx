import {
  Home,
  CircleUser,
  Building,
  Settings,
  ChevronDown,
  Building2,
  UserRoundPen,
  PcCase,
  User,
  IndianRupee,
  BriefcaseConveyorBelt,
  ClipboardList,
  ReceiptIndianRupee,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useState } from "react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { useSidebar } from "@/components/ui/sidebar";
import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
// import { useState } from "react";

type SidebarItem = {
  title: string;
  url?: string;
  icon: React.ElementType;
  submenu?: SidebarItem[];
};

const items1: Record<string, SidebarItem[]> = {
  superadmin: [
    { title: "Home", url: "/superadmin", icon: Home },
    {
      title: "Utilities",
      icon: Settings,
      submenu: [
        { title: "HPT/HPA", url: "/superadmin/AddFirm", icon: Building2 },
        { title: "Branch", url: "/superadmin/AddBranch", icon: Building },
      ],
    },
    { title: "Employees", url: "/superadmin/AddEmployee", icon: CircleUser },
    { title: "Clients", url: "/superadmin/clients", icon: UserRoundPen },
    { title: "My-Cases", url: "/superadmin/cases/Mycases", icon: PcCase },
    { title: "Verified-Cases", url: "/superadmin/cases/all", icon: BriefcaseConveyorBelt},
    { title: "Payments", url: "/superadmin/VerifyPayments", icon: IndianRupee },
    { title: "Tasks", url: "/superadmin/Tasks", icon: ClipboardList},
    { title: "My Profile", url: "/superadmin/Profile", icon: User },
  ],
  client: [
    { title: "My Cases", url: "/client/cases", icon: UserRoundPen },
    { title: "My Transactions", url: "/client/Transactions", icon: IndianRupee },
    { title: "My Bills", url: "/client/Bills", icon: ReceiptIndianRupee },    
    { title: "My Profile", url: "/client/Profile", icon: User },
  ],
  employee: [
    { title: "Home", url: "/employee", icon: Home },
    {
      title: "Case", url: "/employee", icon: UserRoundPen,
      submenu: [
        { title: "New Case", url: "/employee/cases/new", icon: CircleUser },
        { title: "Draft Cases", url: "/employee/cases", icon: PcCase },
        { title: "Verified Cases", url: "/employee/vcases", icon:BriefcaseConveyorBelt  },
      ]
    },
    { title: "Tasks", url: "/employee/Tasks", icon: ClipboardList},
    { title: "My Profile", url: "/employee/Profile", icon: User },
  ],
};

export function AppSidebar() {
  const { user } = useAuth();
  const role = user?.role;
  const items = role ? items1[role] || [] : [];
  const location = useLocation();
  const currentPath = location.pathname;
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { state,isMobile } = useSidebar()
  const isCollapsed = state === "collapsed"

  // Track open state for each collapsible menu by index
  const [openMenus, setOpenMenus] = useState<{ [key: number]: boolean }>(() => {
    const initial: { [key: number]: boolean } = {};
    items.forEach((item, idx) => {
      if (item.submenu) {
        initial[idx] = item.submenu.some(sub => sub.url === currentPath);
      }
    });
    return initial;
  });

    const [open, setOpen] = useState(false);
    const { logout } = useAuth();
    const handleLogout = () => {
      logout();
    };

  const handleToggle = (idx: number) => {
    setOpenMenus((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
 <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Vaahan Record</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, idx) =>
                item.submenu ? (
                  <Collapsible
                    key={idx + 1}
                    open={openMenus[idx] && !isCollapsed}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuItem onClick={() => handleToggle(idx)}>
                        <SidebarMenuButton>
                          <item.icon />
                          {item.title}
                          <ChevronDown
                            className={`ml-auto transition-transform ${
                              openMenus[idx] ? "rotate-180" : ""
                            }`}
                          />
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pl-6">
                      {item.submenu.map((sub) => (
                        <SidebarMenuItem
                          key={sub.title}
                          className={
                            sub.url === currentPath
                              ? "bg-black text-white rounded-lg"
                              : ""
                          }
                        >
                          <SidebarMenuButton asChild>
                            <Link to={sub.url ?? ""}>
                              <sub.icon />
                              {sub.title}
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem
                    key={item.title}
                    className={
                      item.url === currentPath
                        ? "bg-black text-white rounded-lg"
                        : ""
                    }
                  >
                    <SidebarMenuButton asChild>
                      <Link to={item.url ?? ""}>
                        <item.icon />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* === Logout Button in Footer === */}
      <SidebarFooter>
        <Button
          variant="destructive"
          className="w-full cursor-pointer hover:bg-red-800"
          onClick={() => setOpen(true)}
        >
           <LogOut className="w-5 h-5" />
          {/* Show Logout text unless sidebar is collapsed AND not mobile */}
{(!isCollapsed || isMobile) && <span className="ml-2">Logout</span>}

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
              <Button variant="outline" className="cursor-pointer" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="hover:bg-red-800 cursor-pointer"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </Sidebar>

  );
}
