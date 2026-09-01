import type { Metadata } from "next";
import { Geist, Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TRPCReactProvider } from "@/trpc/client";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const terminalMono = JetBrains_Mono({
  variable: "--font-terminal-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Meu - trading system",
  description: "Created by the team of Meu - Goutam, Dhiraj, Jindal, Divyang",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            // Pre-paint look boot — mirrors applySettings in ui-settings.tsx.
            // Sets data-theme, the .dark class and --radius from localStorage so
            // light looks don't flash dark on reload.
            __html: `(function(){try{var d=document.documentElement;var s=JSON.parse(localStorage.getItem("meu:ui-settings")||"{}");var L={violet:"mint",rose:"mint",ocean:"ocean-depths",emerald:"verdant",sunset:"ember",mono:"carbon"};var t=s.look||L[s.colorTheme]||"mint";var R={mint:0.75,phosphor:0,ledger:0.125,"ocean-depths":0.375,ember:0,verdant:0.25,carbon:0};d.setAttribute("data-theme",t);var LIGHT={ledger:1};if(LIGHT[t])d.classList.remove("dark");else d.classList.add("dark");d.style.setProperty("--radius",(R[t]||0)+"rem")}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${terminalMono.variable} antialiased bg-sidebar`}
      >
        <TRPCReactProvider>
          <main>{children}</main>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
