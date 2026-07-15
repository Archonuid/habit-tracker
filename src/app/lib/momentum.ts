import type { Habit, HabitCompletion } from "./types";
import { weeklyReport } from "./report";
import { dailyStreak, perfectDayStreak } from "./streaks";

export interface HeroMomentum {
  dailyStreak: number;
  bestStreak: number;
  frozen: boolean;
  perfectStreak: number;
  dueToday: number;
  doneToday: number;
  remainingToday: number;
  allDoneToday: boolean;
  weeklyPct: number;
  questsThisWeek: number;
  xpThisWeek: number;
}

/** Snapshot of how the hero is doing right now — drives home highlights
 *  and the familiar's contextual dialogue. */
export function computeMomentum(
  habits: Habit[],
  completions: HabitCompletion[]
): HeroMomentum {
  const nonArchived = habits.filter((h) => !h.archived_at);
  const report = weeklyReport(nonArchived, completions, 7);
  const today = report.perDay[report.perDay.length - 1];

  const daysWithAny = new Set(completions.map((c) => c.completed_on.slice(0, 10)));
  const ds = dailyStreak(daysWithAny);

  const compByDay = new Map<string, Set<string>>();
  for (const c of completions) {
    const k = c.completed_on.slice(0, 10);
    if (!compByDay.has(k)) compByDay.set(k, new Set());
    compByDay.get(k)!.add(c.habit_id);
  }
  const ps = perfectDayStreak(nonArchived, compByDay);

  const dueToday = today?.due ?? 0;
  const doneToday = today?.done ?? 0;

  return {
    dailyStreak: ds.current,
    bestStreak: ds.best,
    frozen: ds.frozen,
    perfectStreak: ps.current,
    dueToday,
    doneToday,
    remainingToday: Math.max(0, dueToday - doneToday),
    allDoneToday: dueToday > 0 && doneToday >= dueToday,
    weeklyPct: report.completionPct,
    questsThisWeek: report.questsCompleted,
    xpThisWeek: report.xpEarned,
  };
}
