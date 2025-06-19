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
  IndianRupee
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";


import { useAuth } from "@/context/AuthContext";
import { Link, useLocation } from "react-router-dom";

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
        { title: "HPA/HTP", url: "/superadmin/AddFirm", icon: Building2 },
        { title: "Branch", url: "/superadmin/AddBranch", icon: Building },
      ],
    },
    { title: "Employees", url: "/superadmin/AddEmployee", icon: CircleUser },
    { title: "Clients", url: "/superadmin/clients", icon: UserRoundPen },
    { title: "All-Cases", url: "/superadmin/cases", icon: PcCase },
    { title: "Payments", url: "/superadmin/VerifyPayments", icon: IndianRupee },
    { title: "My Profile", url: "/superadmin/Profile", icon: User },
  ],
  client: [
    { title: "Home", url: "/client", icon: Home },
    { title: "Cases", url: "/client/cases", icon: UserRoundPen },
    { title: "My Profile", url: "/client/Profile", icon: User },
  ],
  employee: [
    { title: "Home", url: "/employee", icon: Home },
    {
      title: "Case", url: "/employee", icon: UserRoundPen,
      submenu: [
        { title: "New Case", url: "/employee/cases/new", icon: CircleUser },
        { title: "Cases", url: "/employee/cases", icon: PcCase }]
    },
    { title: "My Profile", url: "/employee/Profile", icon: User },
  ],
};

export function AppSidebar() {
  const { user } = useAuth();
  const role = user?.role;
  const items = role ? items1[role] || [] : [];
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Vaahan Record</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) =>
                item.submenu ? (
                  <Collapsible
                    key={index + 1}
                    defaultOpen={item.submenu.some((sub) => sub.url === currentPath)}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuItem>
                        <SidebarMenuButton>
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <item.icon />
                              <span>{item.title}</span>
                            </div>
                            <ChevronDown className="transition-transform group-data-[state=open]:rotate-180" />
                          </div>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </CollapsibleTrigger>

                    <CollapsibleContent className="pl-6">
                      {item.submenu.map((sub) => (
                        <SidebarMenuItem
                          key={sub.title}
                          className={sub.url === currentPath ? "bg-black text-white rounded-lg hover:bg-black" : "hover:bg-black hover:text-white rounded-lg"}
                        >
                          <SidebarMenuButton asChild>
                            <Link to={sub.url ?? ""}>
                              <sub.icon />
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem
                    key={item.title}
                    className={item.url === currentPath ? "bg-black text-white rounded-lg hover:bg-black" : "hover:bg-black hover:text-white rounded-lg"}
                  >
                    <SidebarMenuButton asChild>
                      <Link to={item.url ?? ""}>
                        <item.icon className="h-3 w-3" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
