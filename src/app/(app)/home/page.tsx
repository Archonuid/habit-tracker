"use client";

import Link from "next/link";
import { Loader2, Swords } from "lucide-react";
import { useHero } from "@/app/lib/useHero";
import { StatusWindow } from "@/app/components/status-window/StatusWindow";
import { AppHeader } from "@/app/components/AppHeader";

export default function HomePage() {
  const { hero, loading } = useHero();

  return (
    <div className="dark">
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

        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6 py-10 relative z-10">
          {loading || !hero ? (
            <Loader2 className="animate-spin text-muted-foreground" size={22} />
          ) : (
            <>
              <StatusWindow hero={hero} />

              <Link
                href="/tracker"
                className="flex items-center gap-2.5 px-8 py-3 rounded-sm transition-all duration-200 hover:scale-[1.02]"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.22em",
                  background:
                    "linear-gradient(135deg, rgba(124,77,255,0.75) 0%, rgba(90,40,220,0.9) 100%)",
                  border: "1px solid rgba(124,77,255,0.55)",
                  color: "#f0ecff",
                  boxShadow: "0 0 24px rgba(124,77,255,0.18)",
                }}
              >
                <Swords size={14} />
                <span>
                  TODAY&apos;S{" "}
                  {(hero.archetype?.task_term ?? "QUEST").toUpperCase()}S
                </span>
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
