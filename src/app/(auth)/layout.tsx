import { Toaster } from "sonner";
import { MeuMark } from "@/components/meu-logo";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen overflow-hidden"
      style={{
        backgroundImage: "url('/textures/login-texture.svg')",
      }}
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        <MeuMark size={40} className="" />
        <p className="text-xl font-bold tracking-tight">Meu</p>
      </div>
      <div className="auth-shell glass relative w-full max-w-md mx-4 overflow-hidden">
        <div className="auth-scan" />
        {/* terminal title bar */}
        <div className="flex items-center justify-between border-b border-border bg-secondary/60 px-4 py-2 text-[11px] text-muted-foreground">
          <span>
            <span className="text-primary">meu@trading</span>:~/auth
          </span>
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="size-2 bg-status-running/80" />
            <span className="size-2 bg-warning/80" />
            <span className="size-2 bg-destructive/80" />
          </span>
        </div>
        <div className="relative p-2 [&_[data-slot=card]]:py-2">{children}</div>
      </div>
      <Toaster />
    </div>
  );
};

export default Layout;
