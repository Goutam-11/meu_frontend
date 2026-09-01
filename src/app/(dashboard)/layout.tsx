import Header from "@/components/appHeader";
import { AppSidebar } from "@/components/appSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";
import { NotificationWatcher } from "@/features/notifications/components/notification-watcher";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider className="ambient-canvas flex h-screen w-full">
      <AppSidebar />
      <SidebarInset className="flex min-h-0 flex-1">
        <div className="flex min-h-0 flex-col flex-1">
          <Header />
          <main className="flex-1 min-h-0 overflow-auto relative z-[1]">
            {children}
          </main>
        </div>
        <Toaster />
        <NotificationWatcher />
      </SidebarInset>
    </SidebarProvider>

  );
}
