import Header from "@/components/appHeader";
import { AppSidebar } from "@/components/appSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="flex h-screen w-full bg-sidebar">
      <AppSidebar />
      <SidebarInset className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-col flex-1">
          <Header />
          <main className="flex-1 min-h-0 overflow-auto rounded-b-2xl">
            {children}
          </main>
        </div>
        <Toaster />
      </SidebarInset>
    </SidebarProvider>

  );
}
