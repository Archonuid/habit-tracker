// Small local-date helpers. All keys are 'YYYY-MM-DD' in LOCAL time so they
// line up with what the user sees on their calendar.

export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Parse a 'YYYY-MM-DD' (optionally with time) into a LOCAL midnight Date. */
export function parseKey(s: string): Date {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  r.setHours(0, 0, 0, 0);
  return r;
}

export function todayKey(): string {
  return dateKey(startOfToday());
}

/** Inclusive list of the N most recent days, oldest first (ends today). */
export function lastNDays(n: number): Date[] {
  const today = startOfToday();
  const out: Date[] = [];
  for (let i = n - 1; i >= 0; i--) out.push(addDays(today, -i));
  return out;
}
