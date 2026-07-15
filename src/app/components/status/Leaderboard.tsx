"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Crown, Loader2, Medal, Trophy } from "lucide-react";
import { useLeaderboard, type LeaderboardRow } from "@/app/lib/useLeaderboard";
import {
  PERIODS,
  TOP_LIMITS,
  rankTier,
  type LeaderboardPeriod,
} from "@/app/lib/ranks";
import { archetypeStyle } from "@/app/lib/constants";
import { ProfileHoverCard } from "@/app/components/status/ProfileHoverCard";
import type { Hero } from "@/app/lib/types";

const RANK_ACCENT = ["#fbbf24", "#cbd5e1", "#d8905a"]; // gold / silver / bronze

export function Leaderboard({ hero }: { hero: Hero }) {
  const [period, setPeriod] = useState<LeaderboardPeriod>("weekly");
  const [limit, setLimit] = useState(10);
  const { rows, me, loading } = useLeaderboard(period, limit);

  const xpTerm = (hero.archetype?.xp_term ?? "XP").toUpperCase();
  const myId = hero.profile.id;
  const meInList = rows.some((r) => r.user_id === myId);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05 }}
      className="rounded-sm border border-border bg-card/40 p-5 space-y-4"
    >
      <div className="flex items-center gap-2">
        <Trophy size={14} style={{ color: "#fbbf24" }} />
        <h3
          className="text-sm font-bold tracking-[0.14em] uppercase"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          Rankings
        </h3>
      </div>

      {/* Period tabs */}
      <div className="grid grid-cols-3 gap-1.5">
        {PERIODS.map((p) => (
          <Tab
            key={p.id}
            active={period === p.id}
            onClick={() => setPeriod(p.id)}
          >
            {p.label}
          </Tab>
        ))}
      </div>

      {/* Top-N selector */}
      <div className="flex items-center gap-1.5">
        <span
          className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground mr-1"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          Top
        </span>
        {TOP_LIMITS.map((n) => (
          <button
            key={n}
            onClick={() => setLimit(n)}
            className="px-2.5 py-1 rounded-sm border text-[10px] tracking-[0.12em] transition-all"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              color: limit === n ? "var(--accent)" : "var(--muted-foreground)",
              background: limit === n ? "rgba(124,77,255,0.14)" : "transparent",
              borderColor: limit === n ? "rgba(124,77,255,0.5)" : "var(--border)",
            }}
          >
            {n}
          </button>
        ))}
      </div>

      {/* Rows */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-muted-foreground" size={18} />
        </div>
      ) : rows.length === 0 ? (
        <p
          className="text-center py-8 text-[11px] tracking-[0.12em] uppercase text-muted-foreground"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          No heroes ranked yet
        </p>
      ) : (
        <div className="space-y-1.5">
          {rows.map((r) => (
            <Row
              key={r.user_id}
              row={r}
              xpTerm={xpTerm}
              isMe={r.user_id === myId}
            />
          ))}
        </div>
      )}

      {/* Your ranking (always shown, even off the visible list) */}
      {me && (
        <div className="pt-3 border-t border-border/60 space-y-1.5">
          <p
            className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Your Standing {meInList ? "" : "· not in top " + limit}
          </p>
          <div
            className="flex items-center justify-between rounded-sm border px-3 py-2.5"
            style={{
              borderColor: "rgba(124,77,255,0.4)",
              background: "rgba(124,77,255,0.08)",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span
                className="text-sm font-bold tabular-nums"
                style={{ fontFamily: "'Cinzel', serif", color: "var(--accent)" }}
              >
                #{me.rank}
              </span>
              <ProfileHoverCard userId={myId} xpTerm={xpTerm}>
                <span className="text-sm truncate cursor-help hover:underline decoration-dotted underline-offset-2">
                  {hero.profile.username ?? "You"}
                </span>
              </ProfileHoverCard>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span
                className="text-[9px] tracking-[0.12em] uppercase text-muted-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                of {me.total_players}
              </span>
              <span
                className="text-sm font-bold tabular-nums"
                style={{ fontFamily: "'Cinzel', serif", color: "var(--accent)" }}
              >
                {me.xp.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function Row({
  row,
  xpTerm,
  isMe,
}: {
  row: LeaderboardRow;
  xpTerm: string;
  isMe: boolean;
}) {
  const style = archetypeStyle(row.archetype_name);
  const tier = rankTier(row.level, row.archetype_name);
  const podium = row.rank <= 3 ? RANK_ACCENT[row.rank - 1] : null;

  return (
    <div
      className="flex items-center gap-3 rounded-sm px-3 py-2 border"
      style={{
        borderColor: isMe ? "rgba(124,77,255,0.45)" : "transparent",
        background: isMe ? "rgba(124,77,255,0.09)" : `${style.color}08`,
      }}
    >
      {/* Rank number / podium icon */}
      <div className="w-6 flex-shrink-0 flex justify-center">
        {podium ? (
          row.rank === 1 ? (
            <Crown size={15} style={{ color: podium }} />
          ) : (
            <Medal size={15} style={{ color: podium }} />
          )
        ) : (
          <span
            className="text-[11px] font-bold tabular-nums text-muted-foreground"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {row.rank}
          </span>
        )}
      </div>

      {/* Name + archetype */}
      <div className="min-w-0 flex-1">
        <p className="text-sm truncate leading-tight">
          <ProfileHoverCard userId={row.user_id} xpTerm={xpTerm}>
            <span className="cursor-help hover:underline decoration-dotted underline-offset-2">
              {row.username ?? "Nameless Hero"}
            </span>
          </ProfileHoverCard>
          {isMe && (
            <span
              className="ml-1.5 text-[8px] tracking-[0.1em] uppercase"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "var(--accent)",
              }}
            >
              you
            </span>
          )}
        </p>
        <p
          className="text-[8px] tracking-[0.14em] uppercase truncate"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: style.color }}
        >
          {row.archetype_name ?? "Unaligned"} · {tier.name}
        </p>
      </div>

      {/* XP */}
      <div className="text-right flex-shrink-0">
        <p
          className="text-sm font-bold tabular-nums leading-tight"
          style={{ fontFamily: "'Cinzel', serif" }}
        >
          {row.xp.toLocaleString()}
        </p>
        <p
          className="text-[7px] tracking-[0.16em] uppercase text-muted-foreground/70"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {xpTerm}
        </p>
      </div>
    </div>
  );
}

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="py-1.5 rounded-sm border text-[10px] tracking-[0.14em] uppercase transition-all"
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        color: active ? "var(--accent)" : "var(--muted-foreground)",
        background: active ? "rgba(124,77,255,0.14)" : "transparent",
        borderColor: active ? "rgba(124,77,255,0.5)" : "var(--border)",
      }}
    >
      {children}
    </button>
  );
}
