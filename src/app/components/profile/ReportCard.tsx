"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Flame, Scroll, Swords, Trophy } from "lucide-react";
import { archetypeStyle, gradeFor, reportCardTitle } from "@/app/lib/constants";
import { gradeTierName } from "@/app/lib/ranks";
import { weeklyReport } from "@/app/lib/report";
import { dailyStreak } from "@/app/lib/streaks";
import type { Habit, HabitCompletion, Hero } from "@/app/lib/types";

export function ReportCard({
  hero,
  habits,
  completions,
}: {
  hero: Hero;
  habits: Habit[];
  completions: HabitCompletion[];
}) {
  const style = archetypeStyle(hero.archetype?.name);
  const title = reportCardTitle(hero.archetype?.name);
  const xpTerm = (hero.archetype?.xp_term ?? "XP").toUpperCase();
  const taskTerm = (hero.archetype?.task_term ?? "Quest").toUpperCase();

  const report = useMemo(
    () => weeklyReport(habits, completions),
    [habits, completions]
  );
  const grade = gradeFor(report.completionPct);
  const gradeName = gradeTierName(grade.letter, hero.archetype?.name);
  const streak = useMemo(() => {
    const days = new Set(completions.map((c) => c.completed_on.slice(0, 10)));
    return dailyStreak(days);
  }, [completions]);

  const maxXp = Math.max(1, ...report.perDay.map((d) => d.xp));

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-sm border p-6 space-y-5 relative overflow-hidden"
      style={{
        borderColor: `${style.color}40`,
        background: `linear-gradient(160deg, ${style.color}0d 0%, var(--card) 55%)`,
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p
            className="text-[9px] tracking-[0.28em] uppercase text-muted-foreground flex items-center gap-1.5"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <Scroll size={11} /> Last 7 Days
          </p>
          <h3
            className="text-lg font-bold tracking-[0.08em] truncate"
            style={{ fontFamily: "'Cinzel', serif" }}
          >
            {title}
          </h3>
        </div>

        {/* Grade */}
        <div className="text-center flex-shrink-0 max-w-[42%]">
          <div
            className="text-4xl font-bold leading-none"
            style={{ fontFamily: "'Cinzel', serif", color: grade.color }}
          >
            {grade.letter}
          </div>
          <div
            className="text-[11px] font-bold tracking-[0.08em] leading-tight mt-1"
            style={{ fontFamily: "'Cinzel', serif", color: grade.color }}
          >
            {gradeName}
          </div>
          <div
            className="text-[8px] tracking-[0.12em] uppercase mt-0.5"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: grade.color,
            }}
          >
            {report.completionPct}%
          </div>
        </div>
      </div>

      <p
        className="text-[10px] tracking-[0.14em] uppercase text-muted-foreground"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        “{grade.note}”
      </p>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-2.5">
        <Stat
          icon={<Swords size={13} />}
          label={`${taskTerm}S`}
          value={report.questsCompleted}
          color={style.color}
        />
        <Stat
          icon={<Trophy size={13} />}
          label={xpTerm}
          value={`+${report.xpEarned}`}
          color={style.color}
        />
        <Stat
          icon={<Flame size={13} />}
          label="STREAK"
          value={`${streak.current}d`}
          color={style.color}
        />
      </div>

      {/* 7-day XP sparkbars */}
      <div className="space-y-1.5">
        <div className="flex items-end gap-1.5 h-16">
          {report.perDay.map((d) => (
            <div key={d.key} className="flex-1 flex flex-col justify-end">
              <div
                className="rounded-sm w-full transition-all"
                style={{
                  height: `${(d.xp / maxXp) * 100}%`,
                  minHeight: d.xp > 0 ? 4 : 2,
                  background:
                    d.xp > 0 ? style.color : "var(--muted-foreground)",
                  opacity: d.xp > 0 ? 0.85 : 0.25,
                }}
                title={`${d.xp} ${xpTerm} · ${d.done}/${d.due} done`}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1.5">
          {report.perDay.map((d) => (
            <span
              key={d.key}
              className="flex-1 text-center text-[8px] tracking-[0.08em] text-muted-foreground/70"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {d.date
                .toLocaleDateString(undefined, { weekday: "short" })
                .charAt(0)}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function Stat({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="rounded-sm border p-3 text-center space-y-1"
      style={{ borderColor: "var(--border)", background: `${color}08` }}
    >
      <div className="flex justify-center" style={{ color }}>
        {icon}
      </div>
      <div className="text-lg font-bold" style={{ fontFamily: "'Cinzel', serif" }}>
        {value}
      </div>
      <div
        className="text-[8px] tracking-[0.14em] uppercase text-muted-foreground truncate"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {label}
      </div>
    </div>
  );
}
