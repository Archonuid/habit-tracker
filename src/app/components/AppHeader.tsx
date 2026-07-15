"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ListChecks, LogOut, Shield, User } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { ThemeToggle } from "@/app/components/ThemeToggle";

const LINKS = [
  { href: "/home", label: "STATUS", icon: Shield },
  { href: "/tracker", label: "TRACKER", icon: ListChecks },
  { href: "/journal", label: "JOURNAL", icon: BookOpen },
  { href: "/profile", label: "PROFILE", icon: User },
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
        className="text-base sm:text-lg font-bold tracking-[0.2em] sm:tracking-[0.3em] text-foreground/90"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        MYTHLOG
      </Link>

      <nav className="flex items-center gap-1 sm:gap-1.5">
        {LINKS.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              title={l.label}
              aria-label={l.label}
              aria-current={active ? "page" : undefined}
              className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-sm text-[10px] tracking-[0.2em] transition-all duration-150 border"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: active ? "var(--accent)" : "var(--muted-foreground)",
                background: active ? "rgba(124,77,255,0.14)" : "transparent",
                borderColor: active ? "rgba(124,77,255,0.4)" : "transparent",
              }}
            >
              <Icon size={14} className="sm:hidden" />
              <span className="hidden sm:inline">{l.label}</span>
            </Link>
          );
        })}
        <div className="ml-1 sm:ml-2 flex items-center gap-1 sm:gap-1.5">
          <ThemeToggle />
          <button
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out"
            className="w-8 h-8 flex items-center justify-center rounded-sm border border-border text-muted-foreground hover:text-foreground transition-colors"
          >
            <LogOut size={13} />
          </button>
        </div>
      </nav>
    </header>
  );
}
