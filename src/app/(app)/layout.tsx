"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import { AppHeader } from "@/app/components/AppHeader";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { resolvedTheme } = useTheme();

  return (
    <main
      className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden"
      style={{ fontFamily: "'Outfit', sans-serif" }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(109,40,217,0.1) 0%, transparent 65%)",
        }}
      />

      <AppHeader />
      <Toaster
        theme={resolvedTheme === "light" ? "light" : "dark"}
        position="bottom-center"
      />

      <div className="flex-1 flex flex-col relative z-10">{children}</div>
    </main>
  );
}
