"use client";

import { AnimatePresence } from "motion/react";
import { HabitRow } from "./HabitRow";
import { isScheduledOn } from "@/app/lib/schedule";
import type { Streak } from "@/app/lib/streaks";
import type { Habit } from "@/app/lib/types";

export interface HabitActions {
  onComplete: (h: Habit) => void;
  onUncomplete: (h: Habit) => void;
  onPause: (h: Habit) => void;
  onArchive: (h: Habit) => void;
  onDelete: (h: Habit) => void;
  onRename: (h: Habit, title: string) => void;
}

export function TodayView({
  habits,
  doneToday,
  streaks,
  busyId,
  xpTerm,
  taskTerm,
  actions,
}: {
  habits: Habit[]; // non-archived
  doneToday: Set<string>;
  streaks: Map<string, Streak>;
  busyId: string | null;
  xpTerm: string;
  taskTerm: string;
  actions: HabitActions;
}) {
  const today = new Date();

  // Due today & not done, then due & done, then the rest (not scheduled today).
  const sorted = [...habits].sort((a, b) => rank(a) - rank(b));
  function rank(h: Habit) {
    const due = isScheduledOn(h, today) && !h.is_paused;
    const done = doneToday.has(h.id);
    if (due && !done) return 0;
    if (due && done) return 1;
    return 2;
  }

  const dueCount = habits.filter(
    (h) => isScheduledOn(h, today) && !h.is_paused
  ).length;
  const doneCount = habits.filter(
    (h) => isScheduledOn(h, today) && !h.is_paused && doneToday.has(h.id)
  ).length;

  if (habits.length === 0) {
    return (
      <p className="text-center text-[11px] tracking-[0.18em] text-muted-foreground py-10 mono">
        NO {taskTerm}S YET — FORGE YOUR FIRST ONE ABOVE
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-[9px] tracking-[0.22em] uppercase text-muted-foreground mono">
          Today · {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            month: "short",
            day: "numeric",
          })}
        </p>
        <p className="text-[9px] tracking-[0.18em] uppercase text-accent mono">
          {doneCount}/{dueCount} done
        </p>
      </div>

      <div className="space-y-2.5">
        <AnimatePresence initial={false}>
          {sorted.map((habit) => (
            <HabitRow
              key={habit.id}
              habit={habit}
              done={doneToday.has(habit.id)}
              busy={busyId === habit.id}
              streak={streaks.get(habit.id) ?? { current: 0, best: 0, frozen: false }}
              xpTerm={xpTerm}
              taskTerm={taskTerm}
              onComplete={() => actions.onComplete(habit)}
              onUncomplete={() => actions.onUncomplete(habit)}
              onPause={() => actions.onPause(habit)}
              onArchive={() => actions.onArchive(habit)}
              onDelete={() => actions.onDelete(habit)}
              onRename={(t) => actions.onRename(habit, t)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
