import type { Archetype as SigilArchetype } from "@/app/components/sigil/sigils";

export interface Archetype {
  name: string;
  color: string;
  tagline: string;
}

export interface FloatingChip {
  name: string;
  color: string;
  top: string;
  left?: string;
  right?: string;
}

export const ARCHETYPES: Archetype[] = [
  { name: "HUNTER", color: "#f87171", tagline: "Track. Pursue. Conquer." },
  { name: "ASSASSIN", color: "#c084fc", tagline: "Shadow. Strike. Vanish." },
  { name: "ADVENTURER", color: "#fbbf24", tagline: "Roam. Discover. Claim." },
  { name: "SIREN", color: "#f472b6", tagline: "Enchant. Lure. Reign." },
  { name: "CYBORG", color: "#22d3ee", tagline: "Optimize. Upgrade. Ascend." },
  { name: "ELF", color: "#4ade80", tagline: "Ancient. Precise. Timeless." },
  { name: "RANKER", color: "#fb923c", tagline: "Compete. Rise. Dominate." },
  { name: "PLAYER", color: "#818cf8", tagline: "Grind. Level. Prevail." },
];

// Visual styling for archetypes as they are named in the Supabase
// `archetypes` table (proper case). Colors/taglines are presentation-only.
export const ARCHETYPE_STYLES: Record<
  string,
  { color: string; tagline: string }
> = {
  Hunter: { color: "#f87171", tagline: "Track. Pursue. Conquer." },
  Assassin: { color: "#c084fc", tagline: "Shadow. Strike. Vanish." },
  Adventurer: { color: "#fbbf24", tagline: "Roam. Discover. Claim." },
  Siren: { color: "#f472b6", tagline: "Enchant. Lure. Reign." },
  Cyborg: { color: "#22d3ee", tagline: "Optimize. Upgrade. Ascend." },
  Elf: { color: "#4ade80", tagline: "Ancient. Precise. Timeless." },
  Ranker: { color: "#fb923c", tagline: "Compete. Rise. Dominate." },
  Player: { color: "#818cf8", tagline: "Grind. Level. Prevail." },
  Traveller: { color: "#34d399", tagline: "Wander. Witness. Transcend." },
};

export function archetypeStyle(name: string | undefined | null) {
  return (
    ARCHETYPE_STYLES[name ?? ""] ?? {
      color: "#7c4dff",
      tagline: "Forge your own path.",
    }
  );
}

export interface Personality {
  id: string;
  name: string;
  color: string;
  tagline: string;
}

export const PERSONALITIES: Personality[] = [
  { id: "genki", name: "GENKI", color: "#fbbf24", tagline: "Boundless energy. Believes in you LOUDLY." },
  { id: "tsundere", name: "TSUNDERE", color: "#f472b6", tagline: "It's not like they care if you level up. Baka." },
  { id: "kuudere", name: "KUUDERE", color: "#22d3ee", tagline: "Cold logic. Quiet loyalty. Zero wasted words." },
  { id: "sensei", name: "SENSEI", color: "#4ade80", tagline: "Ancient wisdom. Endless patience. Cryptic advice." },
  { id: "chaotic", name: "CHAOTIC", color: "#c084fc", tagline: "Unhinged gremlin energy. Chaos is a ladder." },
  { id: "deadpan", name: "DEADPAN", color: "#94a3b8", tagline: "Dry wit. Brutal honesty. Secretly proud of you." },
];

// Weekly report card renamed per archetype (proper-case keys, matching the
// Supabase `archetypes` table).
export const REPORT_CARD_TITLES: Record<string, string> = {
  Hunter: "Hunter's Field Report",
  Assassin: "Assassin's Contract Ledger",
  Adventurer: "Adventurer's Travel Log",
  Siren: "Siren's Songbook",
  Cyborg: "Cyborg's Diagnostics Log",
  Elf: "Elf's Ancient Scroll",
  Ranker: "Ranker's Ladder Report",
  Player: "Player's Scoreboard",
  Traveller: "Traveller's Chronicle",
};

export function reportCardTitle(name: string | undefined | null) {
  return REPORT_CARD_TITLES[name ?? ""] ?? "Weekly Report Card";
}

// The companion is an archetype-bound sigil/rune instead of a familiar. Each
// archetype names its sigil differently (proper-case keys, matching the
// Supabase `archetypes` table).
export const SIGIL_TERMS: Record<string, string> = {
  Adventurer: "Compass",
  Elf: "Rune",
  Player: "System Window",
  Traveller: "Constellation",
  Assassin: "Mark",
  Cyborg: "Core",
  Hunter: "Quarry",
  Siren: "Tide",
  Ranker: "Crest",
};

/** What this archetype calls its companion sigil (e.g. "Compass"). */
export function sigilTerm(name: string | undefined | null) {
  return SIGIL_TERMS[name ?? ""] ?? "Sigil";
}

const SIGIL_KEYS = new Set<SigilArchetype>([
  "adventurer",
  "assassin",
  "cyborg",
  "elf",
  "hunter",
  "player",
  "siren",
  "ranker",
  "traveller",
]);

/** Maps a proper-case archetype name to its lowercase Sigil registry key. */
export function sigilKey(name: string | undefined | null): SigilArchetype {
  const k = (name ?? "").toLowerCase() as SigilArchetype;
  return SIGIL_KEYS.has(k) ? k : "adventurer";
}

// Weekdays in JS getDay() convention (0=Sun … 6=Sat), displayed Mon-first.
export const WEEKDAYS: { i: number; short: string; label: string }[] = [
  { i: 1, short: "M", label: "Mon" },
  { i: 2, short: "T", label: "Tue" },
  { i: 3, short: "W", label: "Wed" },
  { i: 4, short: "T", label: "Thu" },
  { i: 5, short: "F", label: "Fri" },
  { i: 6, short: "S", label: "Sat" },
  { i: 0, short: "S", label: "Sun" },
];

// Letter grades for the weekly report card, keyed off completion %.
export const GRADES: { min: number; letter: string; color: string; note: string }[] = [
  { min: 95, letter: "S", color: "#fbbf24", note: "Legendary discipline" },
  { min: 85, letter: "A", color: "#4ade80", note: "Heroic consistency" },
  { min: 70, letter: "B", color: "#22d3ee", note: "Steady progress" },
  { min: 50, letter: "C", color: "#818cf8", note: "Finding your rhythm" },
  { min: 30, letter: "D", color: "#fb923c", note: "The grind is real" },
  { min: 0, letter: "F", color: "#f87171", note: "A new arc begins" },
];

export function gradeFor(pct: number) {
  return GRADES.find((g) => pct >= g.min) ?? GRADES[GRADES.length - 1];
}

export const INTEREST_TAGS: { name: string; color: string }[] = [
  { name: "SHONEN", color: "#f87171" },
  { name: "ISEKAI", color: "#c084fc" },
  { name: "SLICE OF LIFE", color: "#4ade80" },
  { name: "MECHA", color: "#22d3ee" },
  { name: "FANTASY", color: "#818cf8" },
  { name: "ROMANCE", color: "#f472b6" },
  { name: "SPORTS", color: "#fb923c" },
  { name: "HORROR", color: "#94a3b8" },
  { name: "SEINEN", color: "#fbbf24" },
  { name: "CYBERPUNK", color: "#2dd4bf" },
  { name: "MARTIAL ARTS", color: "#e879f9" },
  { name: "MYSTERY", color: "#a3e635" },
];

export const FLOATING_CHIPS: FloatingChip[] = [
  { name: "HUNTER", color: "#f87171", top: "9%", left: "5%" },
  { name: "ASSASSIN", color: "#c084fc", top: "17%", right: "8%" },
  { name: "ADVENTURER", color: "#fbbf24", top: "64%", left: "3%" },
  { name: "SIREN", color: "#f472b6", top: "79%", right: "5%" },
  { name: "CYBORG", color: "#22d3ee", top: "38%", left: "2%" },
  { name: "ELF", color: "#4ade80", top: "50%", right: "3%" },
  { name: "RANKER", color: "#fb923c", top: "88%", left: "16%" },
  { name: "PLAYER", color: "#818cf8", top: "11%", right: "21%" },
];
