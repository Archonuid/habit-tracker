"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Loader2, Swords } from "lucide-react";
import { useHero } from "@/app/lib/useHero";
import { useHabitData } from "@/app/lib/useHabitData";
import { computeMomentum } from "@/app/lib/momentum";
import { StatusWindow } from "@/app/components/status-window/StatusWindow";
import { RankBadge } from "@/app/components/status/RankBadge";
import { Leaderboard } from "@/app/components/status/Leaderboard";

export default function HomePage() {
  const { hero, loading } = useHero();
  const { habits, completions, loading: dataLoading } = useHabitData();

  const momentum = useMemo(
    () => (dataLoading ? undefined : computeMomentum(habits, completions)),
    [habits, completions, dataLoading]
  );

  if (loading || !hero) {
    return (
      <div className="flex-1 flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-muted-foreground" size={22} />
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        {/* Column A — hero identity + call to action */}
        <div className="flex flex-col gap-5">
          <StatusWindow hero={hero} momentum={momentum} />

          <Link
            href="/tracker"
            className="flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-sm transition-all duration-200 hover:scale-[1.02]"
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
              TODAY&apos;S {(hero.archetype?.task_term ?? "QUEST").toUpperCase()}S
            </span>
          </Link>
        </div>

        {/* Column B — rank + rankings */}
        <div className="flex flex-col gap-5">
          <RankBadge hero={hero} />
          <Leaderboard hero={hero} />
        </div>
      </div>
    </div>
  );
}
