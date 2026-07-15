// Overall rank tiers — an archetype's "power rating", derived from level.
// Seven tiers, lowest → highest: F E D C B A S. Each archetype renames them
// with its own flavor (Hunter → "S-Rank", Elf → "Elder", Cyborg → "Singularity").
//
// Tiers key off LEVEL (not percentile) so a lone player still has a real rank
// that climbs as they grind — the Solo-Leveling / hunter-rank feel.

export interface RankTier {
  /** 0 = F (lowest) … 6 = S (highest). */
  index: number;
  /** Canonical letter, always S/A/B/C/D/E/F. */
  letter: string;
  /** Archetype-flavored name for this tier. */
  name: string;
  color: string;
}

export const TIER_LETTERS = ["F", "E", "D", "C", "B", "A", "S"] as const;

// Rarity ramp: gray → green → cyan → blue → purple → pink → gold.
export const TIER_COLORS = [
  "#94a3b8", // F
  "#4ade80", // E
  "#22d3ee", // D
  "#818cf8", // C
  "#c084fc", // B
  "#f472b6", // A
  "#fbbf24", // S
];

// Minimum level to hold each tier (index-aligned with TIER_LETTERS).
const TIER_MIN_LEVEL = [1, 3, 6, 10, 15, 22, 30];

// Archetype-flavored tier names, lowest → highest (7 entries each). Keys match
// the proper-case `archetypes.name` values in Supabase.
export const RANK_NAMES: Record<string, string[]> = {
  Hunter: ["F-Rank", "E-Rank", "D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"],
  Adventurer: ["F-Rank", "E-Rank", "D-Rank", "C-Rank", "B-Rank", "A-Rank", "S-Rank"],
  Ranker: ["Unranked", "Bronze", "Silver", "Gold", "Platinum", "Diamond", "Apex"],
  Player: ["Noob", "Rookie", "Casual", "Pro", "Veteran", "Elite", "Legend"],
  Assassin: ["Initiate", "Cutthroat", "Shadow", "Nightblade", "Reaper", "Phantom", "Grandmaster"],
  Siren: ["Whisper", "Charmer", "Enchantress", "Muse", "Diva", "Temptress", "Sovereign"],
  Cyborg: ["v0.1", "v0.5", "v1.0", "v2.0", "Mk-III", "Overclocked", "Singularity"],
  Elf: ["Sapling", "Youngblood", "Warden", "Sage", "Highborn", "Ancient", "Elder"],
  Traveller: ["Wanderer", "Nomad", "Pathfinder", "Voyager", "Pioneer", "Pilgrim", "Ascendant"],
};

const DEFAULT_NAMES = ["F", "E", "D", "C", "B", "A", "S"];

/** Tier index (0–6) for a given level. */
export function tierIndexForLevel(level: number): number {
  let idx = 0;
  for (let i = 0; i < TIER_MIN_LEVEL.length; i++) {
    if (level >= TIER_MIN_LEVEL[i]) idx = i;
  }
  return idx;
}

/** Full tier descriptor for a level + archetype. */
export function rankTier(
  level: number,
  archetype: string | null | undefined
): RankTier {
  const index = tierIndexForLevel(level);
  const names = RANK_NAMES[archetype ?? ""] ?? DEFAULT_NAMES;
  return {
    index,
    letter: TIER_LETTERS[index],
    name: names[index],
    color: TIER_COLORS[index],
  };
}

/** Levels remaining until the next tier, plus that tier's name (null at S). */
export function nextTier(
  level: number,
  archetype: string | null | undefined
): { name: string; letter: string; levelsAway: number } | null {
  const index = tierIndexForLevel(level);
  if (index >= TIER_LETTERS.length - 1) return null;
  const names = RANK_NAMES[archetype ?? ""] ?? DEFAULT_NAMES;
  const next = index + 1;
  return {
    name: names[next],
    letter: TIER_LETTERS[next],
    levelsAway: Math.max(1, TIER_MIN_LEVEL[next] - level),
  };
}

// The weekly report grade (S/A/B/C/D/F, from completion %) expressed in the
// archetype's flavored vocabulary — reuses the same rank-tier names so the
// whole app rates you in one voice. Maps each grade onto a tier slot.
const GRADE_TO_TIER: Record<string, number> = {
  F: 0,
  D: 2,
  C: 3,
  B: 4,
  A: 5,
  S: 6,
};

export function gradeTierName(
  gradeLetter: string,
  archetype: string | null | undefined
): string {
  const names = RANK_NAMES[archetype ?? ""] ?? DEFAULT_NAMES;
  return names[GRADE_TO_TIER[gradeLetter] ?? 0];
}

export type LeaderboardPeriod = "weekly" | "monthly" | "all";

export const PERIODS: { id: LeaderboardPeriod; label: string }[] = [
  { id: "weekly", label: "Weekly" },
  { id: "monthly", label: "Monthly" },
  { id: "all", label: "All-Time" },
];

export const TOP_LIMITS = [10, 20, 50];
