"use client";

import { motion } from "motion/react";
import { ShieldHalf } from "lucide-react";
import { levelProgress } from "@/app/lib/xp";
import { rankTier, nextTier } from "@/app/lib/ranks";
import { archetypeStyle } from "@/app/lib/constants";
import type { Hero } from "@/app/lib/types";

/** The hero's overall rating: an archetype-flavored tier from their level. */
export function RankBadge({ hero }: { hero: Hero }) {
  const level = levelProgress(hero.profile.current_xp).level;
  const archetype = hero.archetype?.name ?? null;
  const tier = rankTier(level, archetype);
  const next = nextTier(level, archetype);
  const style = archetypeStyle(archetype);
  const levelTerm = hero.archetype?.level_term ?? "Level";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-sm border p-5 relative overflow-hidden"
      style={{
        borderColor: `${tier.color}45`,
        background: `linear-gradient(150deg, ${tier.color}14 0%, var(--card) 60%)`,
        boxShadow: `0 0 32px ${tier.color}14`,
      }}
    >
      <div
        className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(${tier.color}2e, transparent 70%)` }}
      />

      <p
        className="text-[9px] tracking-[0.28em] uppercase text-muted-foreground flex items-center gap-1.5 relative"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <ShieldHalf size={11} /> Overall Rank
      </p>

      <div className="flex items-center gap-4 mt-3 relative">
        {/* Big tier letter */}
        <div
          className="flex flex-col items-center justify-center w-20 h-20 rounded-sm border flex-shrink-0"
          style={{
            borderColor: `${tier.color}66`,
            background: `${tier.color}18`,
            boxShadow: `0 0 24px ${tier.color}33`,
          }}
        >
          <span
            className="text-5xl font-bold leading-none"
            style={{ fontFamily: "'Cinzel', serif", color: tier.color }}
          >
            {tier.letter}
          </span>
        </div>

        <div className="min-w-0">
          <h3
            className="text-xl font-bold tracking-[0.08em] truncate"
            style={{ fontFamily: "'Cinzel', serif", color: tier.color }}
          >
            {tier.name}
          </h3>
          <p
            className="text-[10px] tracking-[0.16em] uppercase text-muted-foreground mt-0.5"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {levelTerm} {level} · {style.tagline.split(".")[0]}
          </p>
          {next ? (
            <p
              className="text-[9px] tracking-[0.12em] uppercase text-muted-foreground/70 mt-1.5"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {next.levelsAway} {levelTerm.toLowerCase()}
              {next.levelsAway > 1 ? "s" : ""} → {next.name}
            </p>
          ) : (
            <p
              className="text-[9px] tracking-[0.12em] uppercase mt-1.5"
              style={{ fontFamily: "'JetBrains Mono', monospace", color: tier.color }}
            >
              ◆ Peak tier reached
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
