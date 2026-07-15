import { WEEKDAYS } from "./constants";

type Scheduled = { weekdays: number[] | null };

/** True when the habit has no specific weekday restriction. */
export function isEveryDay(h: Scheduled): boolean {
  return !h.weekdays || h.weekdays.length === 0 || h.weekdays.length === 7;
}

/** Is this habit due on the given date? (JS getDay: 0=Sun … 6=Sat) */
export function isScheduledOn(h: Scheduled, date: Date): boolean {
  if (isEveryDay(h)) return true;
  return h.weekdays!.includes(date.getDay());
}

/** Human label for a schedule, e.g. "Every day", "Weekdays", "Mon · Wed · Fri". */
export function scheduleLabel(h: Scheduled): string {
  if (isEveryDay(h)) return "Every day";
  const set = new Set(h.weekdays);
  const isWeekdays =
    set.size === 5 && [1, 2, 3, 4, 5].every((d) => set.has(d));
  const isWeekends = set.size === 2 && set.has(0) && set.has(6);
  if (isWeekdays) return "Weekdays";
  if (isWeekends) return "Weekends";
  return WEEKDAYS.filter((d) => set.has(d.i))
    .map((d) => d.label)
    .join(" · ");
}
