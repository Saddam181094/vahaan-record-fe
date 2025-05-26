import {
  Home,
  CircleUser,
  Building,
  Settings,
  ChevronDown,
  Building2,
  UserRoundPen,
  Circle
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
import { Link } from "react-router-dom";

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
        { title: "Firm", url: "/superadmin/AddFirm", icon: Building2 },
        { title: "Branch", url: "/superadmin/AddBranch", icon: Building },
      ],
    },
    { title: "Employees", url: "/superadmin/AddEmployee", icon: CircleUser },
    { title: "U-Clients", url: "/superadmin/UnverifiedClients", icon: UserRoundPen },
  ],
  client: [
    { title: "Home", url: "/client/home", icon: Home },
  ],
  employee: [
    { title: "Home", url: "/employee", icon: Home },
     { title: "Case", url: "/employee/CaseForm", icon: CircleUser },
  ],
};

export function AppSidebar() {
  const { user } = useAuth();
  const role = user?.role;
  const items = role ? items1[role] || [] : [];

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item, index) =>
                item.submenu ? (
                  <Collapsible key={index + 1}>
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
                        <SidebarMenuItem key={sub.title}>
                          <SidebarMenuButton asChild>
                            <Link to={sub?.url ?? ''}>
                              <sub.icon />
                              <span>{sub.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link to={item.url ?? ""}>
                        <item.icon className="h-4 w-4" />
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
