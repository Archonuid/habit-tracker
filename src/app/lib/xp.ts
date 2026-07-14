// Level curve: total XP required to reach level L is 50·L·(L−1).
// Level 2 at 100 XP, level 3 at 300, level 4 at 600, level 5 at 1000 …
// Must stay in sync with public.level_from_xp in supabase/schema.sql

export function levelFromXp(xp: number): number {
  return Math.floor((1 + Math.sqrt(1 + 0.08 * Math.max(xp, 0))) / 2);
}

/** Total XP at which the given level begins. */
export function xpForLevel(level: number): number {
  return 50 * level * (level - 1);
}

/** Progress through the current level, for XP bars. */
export function levelProgress(xp: number): {
  level: number;
  current: number;
  needed: number;
  pct: number;
} {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const ceil = xpForLevel(level + 1);
  const current = xp - floor;
  const needed = ceil - floor;
  return { level, current, needed, pct: Math.min(100, (current / needed) * 100) };
}

// Difficulty is stored as the habit's xp_reward (the habits table has no
// difficulty column); these tiers map rewards back to labels.
export const DIFFICULTIES = [
  { id: "easy", label: "MINOR QUEST", xp: 10, color: "#4ade80" },
  { id: "medium", label: "SIDE QUEST", xp: 25, color: "#fbbf24" },
  { id: "hard", label: "RAID", xp: 50, color: "#f87171" },
] as const;

export type Difficulty = (typeof DIFFICULTIES)[number]["id"];

export function difficultyFromReward(xpReward: number) {
  if (xpReward >= 50) return DIFFICULTIES[2];
  if (xpReward >= 25) return DIFFICULTIES[1];
  return DIFFICULTIES[0];
}
