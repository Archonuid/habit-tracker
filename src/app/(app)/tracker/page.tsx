"use client";

import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useHero } from "@/app/lib/useHero";
import { levelProgress } from "@/app/lib/xp";
import { archetypeStyle } from "@/app/lib/constants";
import { Tracker } from "@/app/components/tracker/Tracker";

export default function TrackerPage() {
  const { hero, setStats, loading } = useHero();

  const style = archetypeStyle(hero?.archetype?.name);
  const progress = hero ? levelProgress(hero.profile.current_xp) : null;
  const taskTerm = (hero?.archetype?.task_term ?? "Quest").toUpperCase();
  const xpTerm = (hero?.archetype?.xp_term ?? "XP").toUpperCase();
  const levelTerm = (hero?.archetype?.level_term ?? "Level").toUpperCase();

  return (
    <div className="flex-1 flex flex-col items-center gap-6 px-6 py-10">
      {loading || !hero || !progress ? (
        <div className="flex-1 flex items-center">
          <Loader2 className="animate-spin text-muted-foreground" size={22} />
        </div>
      ) : (
        <>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-[0.25em] serif">
              {taskTerm} LOG
            </h1>
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mono">
              Complete {taskTerm}S · Earn {xpTerm} · {levelTerm} up
            </p>
          </div>

          {/* Compact XP bar */}
          <div className="w-full max-w-xl space-y-1.5">
            <div className="flex justify-between text-[9px] tracking-[0.18em] text-muted-foreground uppercase mono">
              <span style={{ color: style.color }}>
                {levelTerm}.{progress.level} {hero.profile.username}
              </span>
              <span>
                {progress.current} / {progress.needed} {xpTerm}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-border/60">
              <motion.div
                animate={{ width: `${progress.pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${style.color}aa, ${style.color})`,
                  boxShadow: `0 0 12px ${style.color}80`,
                }}
              />
            </div>
          </div>

          <Tracker hero={hero} onStatsChange={setStats} />
        </>
      )}
    </div>
  );
}
