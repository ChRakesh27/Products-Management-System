import { Calendar, Home, Inbox, User } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

// Menu items.
const items = [
  {
    title: "POs Received",
    url: "/po-received",
    icon: Home,
  },
  {
    title: "Products",
    url: "/products",
    icon: Inbox,
  },
  {
    title: "POs Given ",
    url: "/po-given",
    icon: Home,
  },
  {
    title: "Materials",
    url: "/materials",
    icon: Calendar,
  },
  {
    title: "Work order",
    url: "/manufactures",
    icon: Calendar,
  },

  {
    title: "Production",
    url: "/production",
    icon: Inbox,
  },
  {
    title: "Inventory",
    url: "/production",
    icon: Inbox,
  },
  {
    title: "Supplier",
    url: "/vendors",
    icon: User,
  },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Sunya</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
