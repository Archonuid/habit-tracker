"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";

const LINKS = [
  { href: "/home", label: "STATUS" },
  { href: "/tracker", label: "TRACKER" },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-4 border-b border-border/60 relative z-20">
      <Link
        href="/home"
        className="text-lg font-bold tracking-[0.3em] text-foreground/90"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        MYTHLOG
      </Link>

      <nav className="flex items-center gap-1.5">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className="px-3 py-1.5 rounded-sm text-[10px] tracking-[0.2em] transition-all duration-150 border"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: active ? "var(--accent)" : "var(--muted-foreground)",
                background: active ? "rgba(124,77,255,0.14)" : "transparent",
                borderColor: active ? "rgba(124,77,255,0.4)" : "transparent",
              }}
            >
              {l.label}
            </Link>
          );
        })}
        <button
          onClick={signOut}
          title="Sign out"
          className="ml-2 w-8 h-8 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut size={13} />
        </button>
      </nav>
    </header>
  );
}
