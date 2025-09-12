import {
  Boxes,
  ClipboardList,
  Factory,
  Home,
  Inbox,
  Layers,
  PackageCheck,
  Settings,
  ShoppingCart,
  User,
} from "lucide-react";
import React, { useEffect, useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "../ui/sidebar";

import { useSelector } from "react-redux";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

// ---- Helpers ---------------------------------------------------------------
const cx = (...classes) => classes.filter(Boolean).join(" ");

// Determine active route using window.location as a fallback
const useActivePath = () => {
  const [path, setPath] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/"
  );
  useEffect(() => {
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  return path;
};
// ---- Data -----------------------------------------------------------------
const NAV = [
  {
    label: "Operations",
    items: [
      { title: "Style / Products", url: "/products", icon: Layers },
      { title: "Materials", url: "/materials", icon: Boxes },
      { title: "Work Orders", url: "/manufactures", icon: Factory },
      { title: "Production", url: "/production", icon: ClipboardList },
      { title: "Inventory", url: "/inventory", icon: PackageCheck },
    ],
  },
  {
    label: "Procurement",
    items: [
      { title: "POs Customers", url: "/po-received", icon: Inbox },
      { title: "POs Vendors", url: "/po-given", icon: ShoppingCart },
      { title: "Business Partners", url: "/partners", icon: User },
      { title: "Dashboard", url: "/", icon: Home },
    ],
  },
];

// ---- Component ------------------------------------------------------------
export function AppSidebar() {
  const activePath = useActivePath();
  const [collapsed, setCollapsed] = React.useState(false);
  const usersDetails = useSelector((state: any) => state?.users);

  return (
    <TooltipProvider delayDuration={100}>
      <Sidebar
        className={cx(
          "bg-gradient-to-b from-background/80 to-background/40 backdrop-blur supports-[backdrop-filter]:bg-background/60",
          "border-r border-border/60"
        )}
        data-collapsed={collapsed ? "true" : "false"}
      >
        <SidebarHeader className="px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-xl bg-primary/10 grid place-items-center">
              <span className="text-sm font-bold text-primary">S</span>
            </div>
            {!collapsed && (
              <div className="flex-1">
                <div className="text-sm font-semibold leading-tight">Sunya</div>
                <div className="text-[11px] text-muted-foreground leading-tight">
                  Manufacturing Suite
                </div>
              </div>
            )}
          </div>
        </SidebarHeader>

        <Separator />

        <SidebarContent className="px-2 py-2">
          {NAV.map((group) => (
            <SidebarGroup key={group.label} className="mb-2">
              {!collapsed && (
                <SidebarGroupLabel className="text-[11px] tracking-wide uppercase text-muted-foreground px-2">
                  {group.label}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon || Home;
                    const active = activePath === item.url;
                    const button = (
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={cx(
                          "h-9",
                          active
                            ? "bg-primary/10 text-primary hover:bg-primary/20"
                            : "hover:bg-muted/60"
                        )}
                      >
                        <a href={item.url} className="flex items-center gap-2">
                          <Icon className="size-4 shrink-0" />
                          {!collapsed && (
                            <span className="truncate">{item.title}</span>
                          )}
                        </a>
                      </SidebarMenuButton>
                    );

                    return (
                      <SidebarMenuItem key={item.title}>
                        {collapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="right">
                              {item.title}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          button
                        )}
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <Separator />

        <SidebarFooter className="px-2 py-2">
          <div
            className={cx(
              "flex items-center gap-2 rounded-lg px-2 py-1.5",
              collapsed ? "justify-center" : ""
            )}
          >
            <Avatar className="size-7">
              <AvatarFallback className="text-[10px]">
                {usersDetails.name[0]}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-xs font-medium leading-tight">
                  {usersDetails.name}
                </div>
              </div>
            )}
            {/* <div className="ml-auto flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7"
                    asChild
                  >
                    <a href="/settings" aria-label="Settings">
                      <Settings className="size-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            </div> */}
          </div>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
