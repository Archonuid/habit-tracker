import type { Habit } from "./types";
import { isScheduledOn } from "./schedule";
import { addDays, dateKey, parseKey, startOfToday } from "./dates";

// How many consecutive missed scheduled days a streak can survive (freeze).
export const GRACE_DAYS = 2;

export interface Streak {
  current: number; // completed scheduled days in the live run
  best: number; // longest such run ever
  frozen: boolean; // alive but the most recent scheduled day(s) were missed
}

type HabitLite = Pick<Habit, "weekdays" | "created_at">;

/**
 * Streak for a single habit given the set of local date-keys it was completed
 * on. A run of completed scheduled days survives up to GRACE_DAYS consecutive
 * misses (the "freeze"); today counts as pending (never a miss) until done.
 */
export function habitStreak(
  habit: HabitLite,
  completed: Set<string>,
  horizonDays = 400
): Streak {
  const today = startOfToday();
  const todayK = dateKey(today);
  const start = parseKey(habit.created_at);

  // ── current: walk backward from today ──
  let current = 0;
  let misses = 0;
  let frozen = false;
  let seenDone = false;
  for (let i = 0; i < horizonDays; i++) {
    const d = addDays(today, -i);
    if (d < start) break;
    if (!isScheduledOn(habit, d)) continue;
    const k = dateKey(d);
    const done = completed.has(k);
    if (k === todayK && !done) continue; // today still pending
    if (done) {
      current++;
      misses = 0;
      seenDone = true;
    } else {
      misses++;
      if (misses > GRACE_DAYS) break;
      if (!seenDone) frozen = true; // recent miss(es) within grace
    }
  }
  if (current === 0) frozen = false;

  // ── best: walk forward from creation ──
  let best = 0;
  let run = 0;
  let m = 0;
  for (let d = new Date(start); d <= today; d = addDays(d, 1)) {
    if (!isScheduledOn(habit, d)) continue;
    const k = dateKey(d);
    const done = completed.has(k);
    if (k === todayK && !done) continue;
    if (done) {
      run++;
      m = 0;
      if (run > best) best = run;
    } else {
      m++;
      if (m > GRACE_DAYS) {
        run = 0;
        m = 0;
      }
    }
  }
  if (current > best) best = current;

  return { current, best, frozen };
}

/**
 * Generic backward streak over a set of qualifying days. `qualifies(dateKey)`
 * returns "done" | "miss" | "skip" for a given day (skip = not evaluated,
 * e.g. no habits scheduled). Grace bridges consecutive misses.
 */
function backwardStreak(
  fromKeys: string[],
  status: (k: string) => "done" | "miss" | "skip"
): Streak {
  let current = 0;
  let misses = 0;
  let frozen = false;
  let seenDone = false;
  const todayK = fromKeys[0];
  for (const k of fromKeys) {
    const s = status(k);
    if (s === "skip") continue;
    if (s === "miss" && k === todayK) continue; // today pending
    if (s === "done") {
      current++;
      misses = 0;
      seenDone = true;
    } else {
      misses++;
      if (misses > GRACE_DAYS) break;
      if (!seenDone) frozen = true;
    }
  }
  if (current === 0) frozen = false;
  return { current, best: current, frozen };
}

/** Consecutive days with at least one completion of anything. */
export function dailyStreak(daysWithAny: Set<string>, horizonDays = 400): Streak {
  const today = startOfToday();
  const keys: string[] = [];
  for (let i = 0; i < horizonDays; i++) keys.push(dateKey(addDays(today, -i)));
  const r = backwardStreak(keys, (k) =>
    daysWithAny.has(k) ? "done" : "miss"
  );
  // best across the whole horizon
  let best = 0,
    run = 0,
    m = 0;
  for (let i = horizonDays - 1; i >= 0; i--) {
    const k = dateKey(addDays(today, -i));
    if (daysWithAny.has(k)) {
      run++;
      m = 0;
      if (run > best) best = run;
    } else if (k !== dateKey(today)) {
      m++;
      if (m > GRACE_DAYS) {
        run = 0;
        m = 0;
      }
    }
  }
  return { ...r, best: Math.max(best, r.current) };
}

/**
 * Consecutive "perfect days": every habit scheduled that day (and already
 * created by then, and not archived) was completed. Days with nothing due are
 * skipped (neutral). Only the current run is returned.
 */
export function perfectDayStreak(
  habits: Habit[],
  completedByDay: Map<string, Set<string>>, // dateKey -> set of habit ids done
  horizonDays = 400
): Streak {
  const today = startOfToday();
  const active = habits.filter((h) => !h.archived_at);
  const keys: string[] = [];
  for (let i = 0; i < horizonDays; i++) keys.push(dateKey(addDays(today, -i)));

  return backwardStreak(keys, (k) => {
    const d = parseKey(k);
    const due = active.filter(
      (h) => isScheduledOn(h, d) && parseKey(h.created_at) <= d && !h.is_paused
    );
    if (due.length === 0) return "skip";
    const done = completedByDay.get(k) ?? new Set<string>();
    return due.every((h) => done.has(h.id)) ? "done" : "miss";
  });
}
