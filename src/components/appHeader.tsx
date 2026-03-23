"use client";
import Image from "next/image";
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

export function BreadcrumbSite({ segments }: { segments: string[] }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/agents">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {segments.map((segment, index) => {
          const href = "/" + segments.slice(0, index + 1).join("/");
          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={href}>{segment}</Link>
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
  const segments = pathname.split("/").filter(Boolean);
  return (
    <div className="flex flex-row items-center w-full shrink-0 border-b border-gray p-2">
      <SidebarTrigger className="mr-2 p-1 size-8" />
      <div className="flex flex-row items-center pr-2">
        <Image src="/img/logo1.png" alt="Logo" width={20} height={20} />
        <span className="text-sm font-normal text-muted-foreground">
          Meu
          <span className="text-sm text-muted-foreground">
            {" "}
            - trading system
          </span>
        </span>
      </div>
      <BreadcrumbSite segments={segments} />
    </div>
  );
};

export default Header;
