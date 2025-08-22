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
    title: "Purchase Orders",
    url: "/",
    icon: Home,
  },
  {
    title: "Items",
    url: "/products",
    icon: Calendar,
  },
  {
    title: "Input",
    url: "/input",
    icon: Calendar,
  },
  {
    title: "Production",
    url: "/production",
    icon: Inbox,
  },

  {
    title: "Supplier",
    url: "/supplier",
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
