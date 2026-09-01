"use client";

import { useEffect, useState } from "react";
import { LogOutIcon } from "lucide-react";
import {
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  Sidebar,
  SidebarContent,
} from "./ui/sidebar";
import { BellDotIcon } from "lucide-react";
import { MeuMark } from "@/components/meu-logo";
import { AgentIcon, BellIcon, CandlesIcon, DashboardIcon, TuneIcon, VaultIcon } from "@/components/meu-icons";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUnreadNotifications } from "@/features/notifications/hooks/use-notifications";
import { useBrowserNotificationPermission } from "@/features/notifications/hooks/use-browser-notifications";
/** Terminal status readout — lives in the sidebar footer. */
function SidebarStatus() {
  const pathname = usePathname();
  const { data } = useUnreadNotifications();
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const unread = data?.count ?? 0;

  return (
    <div className="space-y-1 border border-border bg-background/50 px-2.5 py-2 font-mono text-[11px] leading-none text-muted-foreground group-data-[collapsible=icon]:hidden">
      <div className="flex items-center gap-1.5">
        <span className="pulse-dot inline-block size-1.5 rounded-full bg-status-running" />
        live
      </div>
      <div className="truncate">
        ~{pathname}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span>
          {unread > 0 ? (
            <span className="text-primary">{unread} unread</span>
          ) : (
            "0 unread"
          )}
        </span>
        <span className="tabular-nums">{time}</span>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const router = useRouter()
  const pathname = usePathname();
  const { data: unreadData } = useUnreadNotifications();
  const { permission, request } = useBrowserNotificationPermission();
  const unreadCount = unreadData?.count ?? 0;
  const sidebarItems = [
    { label: "Dashboard", icon: DashboardIcon, url: "/dashboard" },
    { label: "Agents", icon: AgentIcon, url: "/agents" },
    { label: "Exchanges", icon: CandlesIcon, url: "/exchanges" },
    { label: "Credentials", icon: VaultIcon, url: "/credentials" },
    { label: "Notifications", icon: BellIcon, url: "/notifications" },
    { label: "Settings", icon: TuneIcon, url: "/settings" },
  ];

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
           <SidebarMenuButton asChild className="h-auto items-center gap-2.5 py-1">
             <Link href="/dashboard" prefetch>
               <MeuMark size={30}  />
               <span className="flex min-w-0 flex-col leading-tight">
                 <span className="text-sm font-bold tracking-tight">Meu</span>
                 <span className="truncate text-[10px] text-muted-foreground">
                   trading system
                 </span>
               </span>
             </Link>
           </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} className="relative">
                    <Link href={item.url} prefetch>
                      <item.icon />
                      <span>{item.label}</span>
                      {item.label === "Notifications" && unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarStatus />
        <SidebarMenu>
          {permission === "default" && (
            <SidebarMenuItem>
              <SidebarMenuButton
                variant="outline"
                onClick={async () => {
                  const result = await request();
                  if (result === "denied") {
                    toast.error("Browser notifications were blocked");
                  }
                }}
              >
                <BellDotIcon />
                <span>Enable notifications</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
             <SidebarMenuButton
               variant={"outline"}
               className="h-auto border-border/60"
               onClick={() => authClient.signOut({
                 fetchOptions:{
                   onSuccess: () => {
                     router.push("/login")
                   },
                   onError: (error) => {
                     toast.error(`Failed to sign out: ${error}`)
                   }
                 }
               })}>
                 <LogOutIcon />
                 <span>Sign out</span>
             </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
