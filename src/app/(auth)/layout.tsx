import Image from "next/image";
import { Toaster } from "sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-b from-background to-accent">
      <div className="flex items-center justify-center">
        <Image
          src="/img/logo1.png"
          alt="Logo"
          width={40}
          height={40}
          className="motion-reduce:animate-bounce"
        />
        <p>Meu</p>
      </div>
      {children}
      <Toaster />
    </div>
  );
};

export default Layout;
