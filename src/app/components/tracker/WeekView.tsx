"use client";

import { Check, X } from "lucide-react";
import { difficultyFromReward } from "@/app/lib/xp";
import { isScheduledOn } from "@/app/lib/schedule";
import { dateKey, lastNDays, parseKey, startOfToday } from "@/app/lib/dates";
import type { Habit } from "@/app/lib/types";

type Cell = "done" | "failed" | "pending" | "off";

export function WeekView({
  habits,
  compByHabit,
  taskTerm,
}: {
  habits: Habit[]; // non-archived
  compByHabit: Map<string, Set<string>>;
  taskTerm: string;
}) {
  const days = lastNDays(7);
  const today = startOfToday();
  const todayK = dateKey(today);

  if (habits.length === 0) {
    return (
      <p className="text-center text-[11px] tracking-[0.18em] text-muted-foreground py-10 mono">
        NO {taskTerm}S TO CHART YET
      </p>
    );
  }

  const cellFor = (habit: Habit, d: Date): Cell => {
    const k = dateKey(d);
    const done = compByHabit.get(habit.id)?.has(k) ?? false;
    if (done) return "done";
    if (habit.is_paused) return "off";
    if (parseKey(habit.created_at) > d) return "off";
    if (!isScheduledOn(habit, d)) return "off";
    if (k === todayK) return "pending";
    return "failed"; // scheduled, past, not done
  };

  return (
    <div className="rounded-sm border border-border bg-card/40 p-3 overflow-x-auto">
      <div className="min-w-[380px]">
        {/* Header */}
        <div className="flex items-center gap-1.5 pl-1 mb-2">
          <div className="flex-1" />
          {days.map((d) => (
            <div
              key={dateKey(d)}
              className="w-9 text-center text-[8px] tracking-[0.08em] uppercase text-muted-foreground mono"
            >
              <div>{d.toLocaleDateString(undefined, { weekday: "narrow" })}</div>
              <div className="text-muted-foreground/60">{d.getDate()}</div>
            </div>
          ))}
        </div>

        {/* Rows */}
        <div className="space-y-1.5">
          {habits.map((habit) => {
            const meta = difficultyFromReward(habit.xp_reward);
            return (
              <div key={habit.id} className="flex items-center gap-1.5">
                <div
                  className={`flex-1 min-w-0 text-[11px] truncate ${habit.is_paused ? "text-muted-foreground/60" : ""}`}
                  title={habit.title}
                >
                  {habit.title}
                </div>
                {days.map((d) => {
                  const c = cellFor(habit, d);
                  return (
                    <div
                      key={dateKey(d)}
                      className="w-9 h-9 rounded-sm border flex items-center justify-center flex-shrink-0"
                      style={cellStyle(c, meta.color)}
                      title={`${habit.title} · ${d.toLocaleDateString()}`}
                    >
                      {c === "done" && (
                        <Check size={13} strokeWidth={3} style={{ color: meta.color }} />
                      )}
                      {c === "failed" && <X size={12} style={{ color: "#e05252" }} />}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border/60 text-[8px] tracking-[0.12em] uppercase text-muted-foreground mono">
          <span className="flex items-center gap-1">
            <Check size={10} /> done
          </span>
          <span className="flex items-center gap-1" style={{ color: "#e05252" }}>
            <X size={10} /> missed
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-muted-foreground/60" />
            today
          </span>
        </div>
      </div>
    </div>
  );
}

function cellStyle(c: Cell, color: string): React.CSSProperties {
  switch (c) {
    case "done":
      return { borderColor: `${color}70`, background: `${color}1e` };
    case "failed":
      return {
        borderColor: "rgba(224,82,82,0.4)",
        background: "rgba(224,82,82,0.08)",
      };
    case "pending":
      return {
        borderColor: "var(--muted-foreground)",
        borderStyle: "dashed",
        background: "transparent",
      };
    default:
      return { borderColor: "var(--border)", background: "transparent", opacity: 0.4 };
  }
}
