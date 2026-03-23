"use client";

import Image from "next/image";
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
} from "./ui/sidebar";
import { BellDotIcon, CandlestickChartIcon, EyeIcon, HomeIcon, KeyRoundIcon, LogsIcon, Settings2, User2Icon } from "lucide-react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
export function AppSidebar() {
  const { data:session,isPending  } = authClient.useSession()
  const router = useRouter()
  const pathname = usePathname();
  const sidebarItems = [
    { label: "Dashboard", icon: HomeIcon, url: "/dashboard" },
    { label: "Agents", icon: User2Icon, url: "/agents" },
    { label: "Exchanges", icon: CandlestickChartIcon, url: "/exchanges" },
    { label: "Credentials", icon: KeyRoundIcon, url: "/credentials" },
    { label: "Notifications", icon: BellDotIcon, url: "/notifications" },
    { label: "Positions", icon: EyeIcon, url: "/positions" },
    { label: "CapitalLogs", icon: LogsIcon, url: "/orderLogs" },
    { label: "Settings", icon: Settings2, url: "/settings" },
  ];

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
           <SidebarMenuButton asChild>
             <Link href="/dashboard" prefetch>
               <Image src="/img/logo1.png" alt="Logo" width={30} height={30} />
               <span>Meu</span>
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
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url} prefetch>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
             <SidebarMenuButton variant={"default"} className="h-15 border-accent border-2" onClick={() => authClient.signOut({
               fetchOptions:{
                 onSuccess: () => {
                   router.push("/login")
                 },
                 onError: (error) => {
                   toast.error(`Failed to sign out: ${error}`)
                 }
               }
             })}>
                 <Image src="/img/user.png" alt="Logo" width={40} height={40} className="rounded-2xl"/>
                 {!isPending ? <p className="text-sm font-semibold text-muted-foreground">
                   {session?.user.name}
                 </p>: 
                 <p className="text-sm font-semibold text-muted-foreground">
                   Loading...
                 </p>}
             </SidebarMenuButton> 
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
