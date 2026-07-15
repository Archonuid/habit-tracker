"use client";

import { motion } from "motion/react";
import { Eye, EyeOff, ScrollText } from "lucide-react";
import Link from "next/link";
import { archetypeStyle } from "@/app/lib/constants";
import type { Hero } from "@/app/lib/types";

/** The hero's summarized lore intro — the public-facing blurb of who they've become. */
export function LoreIntro({ hero }: { hero: Hero }) {
  const style = archetypeStyle(hero.archetype?.name);
  const intro = hero.profile.lore_intro?.trim();
  const isPublic = hero.profile.lore_public ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-sm border border-border bg-card/40 p-5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <p
          className="text-[9px] tracking-[0.24em] uppercase text-accent flex items-center gap-1.5"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          <ScrollText size={11} /> Legend
        </p>
        <span
          className="text-[8px] tracking-[0.14em] uppercase flex items-center gap-1 text-muted-foreground/70"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
          title={
            isPublic
              ? "Visible on your public profile"
              : "Hidden — change in Privacy settings"
          }
        >
          {isPublic ? <Eye size={10} /> : <EyeOff size={10} />}
          {isPublic ? "Public" : "Private"}
        </span>
      </div>

      {intro ? (
        <p
          className="text-[13px] leading-relaxed serif"
          style={{ color: `${style.color}` }}
        >
          {intro}
        </p>
      ) : (
        <p className="text-[12px] text-muted-foreground leading-relaxed">
          Your legend is yet unwritten.{" "}
          <Link href="/journal" className="text-accent hover:underline">
            Visit the Journal
          </Link>{" "}
          and record your first entry to begin your chronicle.
        </p>
      )}
    </motion.div>
  );
}
