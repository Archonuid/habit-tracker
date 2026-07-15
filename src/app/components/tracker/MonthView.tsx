"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { isScheduledOn } from "@/app/lib/schedule";
import { dateKey, parseKey, startOfToday } from "@/app/lib/dates";
import type { Habit } from "@/app/lib/types";

function hexToRgba(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function MonthView({
  habits,
  compByDay,
  xpByDay,
  color,
  xpTerm,
}: {
  habits: Habit[]; // non-archived
  compByDay: Map<string, Set<string>>;
  xpByDay: Map<string, number>;
  color: string;
  xpTerm: string;
}) {
  const today = startOfToday();
  const [offset, setOffset] = useState(0); // months from current
  const anchor = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const year = anchor.getFullYear();
  const month = anchor.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first leading blanks. JS getDay: 0=Sun..6=Sat -> Mon-first index.
  const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));

  const active = habits.filter((h) => !h.archived_at);
  const dueDone = (d: Date) => {
    let due = 0;
    let done = 0;
    const k = dateKey(d);
    const doneSet = compByDay.get(k);
    for (const h of active) {
      if (h.is_paused) continue;
      if (parseKey(h.created_at) > d) continue;
      if (!isScheduledOn(h, d)) continue;
      due++;
      if (doneSet?.has(h.id)) done++;
    }
    return { due, done };
  };

  const monthXp = cells.reduce(
    (sum, d) => (d ? sum + (xpByDay.get(dateKey(d)) ?? 0) : sum),
    0
  );

  return (
    <div className="rounded-sm border border-border bg-card/40 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOffset((o) => o - 1)}
          className="w-7 h-7 rounded-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="text-center">
          <p className="text-sm font-bold tracking-[0.12em] serif">
            {anchor.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
          </p>
          <p className="text-[8px] tracking-[0.16em] uppercase text-muted-foreground mono">
            +{monthXp} {xpTerm} this month
          </p>
        </div>
        <button
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          disabled={offset >= 0}
          className="w-7 h-7 rounded-sm border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={i}
            className="text-center text-[8px] tracking-[0.08em] uppercase text-muted-foreground/70 mono"
          >
            {d}
          </div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={`b${i}`} />;
          const future = d > today;
          const { due, done } = dueDone(d);
          const ratio = due === 0 ? 0 : done / due;
          const isToday = dateKey(d) === dateKey(today);
          return (
            <div
              key={dateKey(d)}
              className="aspect-square rounded-sm border flex flex-col items-center justify-center relative"
              style={{
                borderColor: isToday ? color : "var(--border)",
                background:
                  future || due === 0
                    ? "transparent"
                    : hexToRgba(color, 0.14 + ratio * 0.55),
                opacity: future ? 0.3 : 1,
              }}
              title={
                future
                  ? d.toLocaleDateString()
                  : `${d.toLocaleDateString()} · ${done}/${due} done · ${xpByDay.get(dateKey(d)) ?? 0} ${xpTerm}`
              }
            >
              <span
                className="text-[10px] mono"
                style={{ color: ratio > 0.5 ? "#fff" : "var(--muted-foreground)" }}
              >
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
