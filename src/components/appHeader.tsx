"use client";
import { SidebarTrigger } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { NotificationBell } from "@/features/notifications/components/notification-bell";

const TITLES: Record<string, string> = {
  dashboard: "Dashboard Overview",
  agents: "Agents",
  exchanges: "Exchanges",
  credentials: "Credentials",
  notifications: "Notifications",
  settings: "Settings",
};

export function BreadcrumbSite({ segments }: { segments: string[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-xs text-muted-foreground">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/dashboard">Main</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={href}>
                    {TITLES[segment] ?? segment}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

const Header = () => {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const segments = pathname.split("/").filter(Boolean);
  const current = segments[segments.length - 1] ?? "dashboard";
  const title = TITLES[current] ?? current;
  return (
    <div className="sticky top-0 z-10 flex flex-row items-center w-full shrink-0 rounded-none border-x-0 border-t-0 border-b bg-background/90 px-4 py-3 backdrop-blur">
      <SidebarTrigger className="mr-3 p-1 size-8" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <h1 className="truncate text-sm font-semibold tracking-tight">
          {title}
        </h1>
        <BreadcrumbSite segments={segments} />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <NotificationBell />
        <div className="flex items-center gap-2.5">
          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-xs font-semibold">
              {session?.user.name ?? "—"}
            </p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Trader
            </p>
          </div>
          <Image
            src="/img/user.png"
            alt="User avatar"
            width={32}
            height={32}
            className="rounded-full ring-1 ring-border"
          />
        </div>
      </div>
    </div>
  );
};

export default Header;
