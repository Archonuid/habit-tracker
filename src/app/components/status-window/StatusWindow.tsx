"use client";

import { useMemo } from "react";
import { motion } from "motion/react";
import { Flame, Snowflake, Target, Trophy } from "lucide-react";
import {
  archetypeStyle,
  gradeFor,
  PERSONALITIES,
  sigilKey,
  sigilTerm,
} from "@/app/lib/constants";
import { gradeTierName } from "@/app/lib/ranks";
import { levelProgress } from "@/app/lib/xp";
import { familiarLine } from "@/app/lib/familiar";
import { Sigil } from "@/app/components/sigil/Sigil";
import type { Hero } from "@/app/lib/types";
import type { HeroMomentum } from "@/app/lib/momentum";

export function StatusWindow({
  hero,
  momentum,
}: {
  hero: Hero;
  momentum?: HeroMomentum;
}) {
  const style = archetypeStyle(hero.archetype?.name);
  const personality = PERSONALITIES.find(
    (p) => p.id === hero.familiar?.personality
  );
  const progress = levelProgress(hero.profile.current_xp);
  const greeting = useMemo(
    () => familiarLine(hero, momentum),
    [hero, momentum]
  );
  const grade = momentum ? gradeFor(momentum.weeklyPct) : null;

  // Per-class lore terms from the archetypes table
  const statusTerm = hero.archetype?.status_term ?? "Status Window";
  const xpTerm = hero.archetype?.xp_term ?? "XP";
  const levelTerm = hero.archetype?.level_term ?? "Level";

  return (
    <div className="w-full max-w-xl space-y-5">
      {/* ── Character card ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-sm border p-6 space-y-5 relative overflow-hidden"
        style={{
          borderColor: `${style.color}45`,
          background: `linear-gradient(160deg, ${style.color}10 0%, var(--card) 55%)`,
          boxShadow: `0 0 40px ${style.color}12`,
        }}
      >
        {/* corner glow */}
        <div
          className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: `radial-gradient(${style.color}22, transparent 70%)` }}
        />

        <div className="flex items-start justify-between gap-4 relative">
          <div className="space-y-1 min-w-0">
            <p
              className="text-[9px] tracking-[0.28em] text-muted-foreground uppercase"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ◈ {statusTerm}
            </p>
            <h2
              className="text-2xl font-bold tracking-[0.12em] truncate"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {hero.profile.username ?? "Nameless Hero"}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-[9px] tracking-[0.2em] px-2 py-0.5 rounded-sm border uppercase"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: style.color,
                  borderColor: `${style.color}50`,
                  background: `${style.color}14`,
                }}
              >
                {hero.archetype?.name ?? "Unaligned"}
              </span>
              <span
                className="text-[9px] tracking-[0.14em] text-muted-foreground uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {style.tagline}
              </span>
            </div>
          </div>

          {/* Level badge */}
          <div
            className="flex flex-col items-center justify-center w-16 h-16 rounded-sm border flex-shrink-0"
            style={{
              borderColor: `${style.color}55`,
              background: `${style.color}12`,
              boxShadow: `0 0 20px ${style.color}20`,
            }}
          >
            <span
              className="text-[8px] tracking-[0.2em] text-muted-foreground uppercase px-1 truncate max-w-full"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {levelTerm}
            </span>
            <span
              className="text-2xl font-bold leading-none"
              style={{ fontFamily: "'Cinzel', serif", color: style.color }}
            >
              {progress.level}
            </span>
          </div>
        </div>

        {/* XP bar */}
        <div className="space-y-1.5 relative">
          <div
            className="flex justify-between text-[9px] tracking-[0.18em] text-muted-foreground uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <span>{xpTerm}</span>
            <span>
              {progress.current} / {progress.needed} → {levelTerm}.
              {progress.level + 1}
            </span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden bg-border/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress.pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${style.color}aa, ${style.color})`,
                boxShadow: `0 0 12px ${style.color}80`,
              }}
            />
          </div>
          <p
            className="text-[9px] tracking-[0.15em] text-muted-foreground/60 text-right uppercase"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {hero.profile.current_xp} TOTAL {xpTerm}
          </p>
        </div>

        {/* Interests */}
        {hero.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 relative">
            {hero.interests.map((tag) => (
              <span
                key={tag}
                className="text-[8px] tracking-[0.16em] px-2 py-0.5 rounded-sm border border-border text-muted-foreground uppercase"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Momentum highlights ── */}
      {momentum && grade && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="grid grid-cols-3 gap-2.5"
        >
          <Highlight
            icon={
              momentum.frozen ? <Snowflake size={14} /> : <Flame size={14} />
            }
            color={momentum.frozen ? "#67e8f9" : "#fb923c"}
            value={`${momentum.dailyStreak}d`}
            label={momentum.frozen ? "Frozen streak" : "Day streak"}
          />
          <Highlight
            icon={<Target size={14} />}
            color={style.color}
            value={`${momentum.doneToday}/${momentum.dueToday}`}
            label="Today"
          />
          <Highlight
            icon={<Trophy size={14} />}
            color={grade.color}
            value={gradeTierName(grade.letter, hero.archetype?.name)}
            label={`${momentum.weeklyPct}% this wk`}
          />
        </motion.div>
      )}

      {/* ── Familiar greeting ── */}
      {hero.familiar && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="rounded-sm border border-border bg-card/40 p-4 flex items-start gap-3.5"
        >
          <div className="flex-shrink-0">
            <Sigil
              archetype={sigilKey(hero.archetype?.name)}
              streak={momentum?.dailyStreak ?? 0}
              level={progress.level}
              size={46}
            />
          </div>
          <div className="space-y-1 min-w-0">
            <p
              className="text-[8px] tracking-[0.24em] uppercase text-muted-foreground/70"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              ◈ {sigilTerm(hero.archetype?.name)}
            </p>
            <p
              className="text-[9px] tracking-[0.2em] uppercase"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: personality?.color ?? "var(--accent)",
              }}
            >
              {hero.familiar.name}
              {personality ? ` · ${personality.name}` : ""}
            </p>
            <p className="text-sm leading-relaxed text-foreground/90">
              “{greeting}”
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Highlight({
  icon,
  color,
  value,
  label,
}: {
  icon: React.ReactNode;
  color: string;
  value: string;
  label: string;
}) {
  return (
    <div
      className="rounded-sm border p-3 text-center space-y-1"
      style={{ borderColor: `${color}30`, background: `${color}0c` }}
    >
      <div className="flex justify-center" style={{ color }}>
        {icon}
      </div>
      <div
        className="text-base sm:text-lg font-bold leading-tight break-words"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        {value}
      </div>
      <div
        className="text-[8px] tracking-[0.12em] uppercase text-muted-foreground truncate"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {label}
      </div>
    </div>
  );
}
