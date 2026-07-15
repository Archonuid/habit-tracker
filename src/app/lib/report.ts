import type { Habit, HabitCompletion } from "./types";
import { isScheduledOn } from "./schedule";
import { dateKey, lastNDays, parseKey } from "./dates";

export interface DayStat {
  key: string;
  date: Date;
  due: number;
  done: number;
  xp: number;
}

export interface WeeklyReport {
  questsCompleted: number;
  xpEarned: number;
  due: number;
  done: number;
  completionPct: number;
  perDay: DayStat[];
}

/**
 * Summarise the last `days` days: how many scheduled habit slots there were,
 * how many were completed, and XP earned. Paused/archived habits and days
 * before a habit existed don't count against you.
 */
export function weeklyReport(
  habits: Habit[],
  completions: HabitCompletion[],
  days = 7
): WeeklyReport {
  const window = lastNDays(days);
  const windowStart = window[0];

  // habit id -> set of completed date-keys
  const doneByHabit = new Map<string, Set<string>>();
  let xpEarned = 0;
  let questsCompleted = 0;
  const xpByDay = new Map<string, number>();

  for (const c of completions) {
    const k = c.completed_on.slice(0, 10);
    const d = parseKey(k);
    if (d < windowStart) continue;
    if (!doneByHabit.has(c.habit_id)) doneByHabit.set(c.habit_id, new Set());
    doneByHabit.get(c.habit_id)!.add(k);
    xpEarned += c.xp_granted ?? 0;
    questsCompleted++;
    xpByDay.set(k, (xpByDay.get(k) ?? 0) + (c.xp_granted ?? 0));
  }

  const active = habits.filter((h) => !h.archived_at);
  let due = 0;
  let done = 0;
  const perDay: DayStat[] = window.map((date) => {
    const k = dateKey(date);
    let dDue = 0;
    let dDone = 0;
    for (const h of active) {
      if (h.is_paused) continue;
      if (parseKey(h.created_at) > date) continue;
      if (!isScheduledOn(h, date)) continue;
      dDue++;
      if (doneByHabit.get(h.id)?.has(k)) dDone++;
    }
    due += dDue;
    done += dDone;
    return { key: k, date, due: dDue, done: dDone, xp: xpByDay.get(k) ?? 0 };
  });

  const completionPct = due === 0 ? 100 : Math.round((done / due) * 100);
  return { questsCompleted, xpEarned, due, done, completionPct, perDay };
}
