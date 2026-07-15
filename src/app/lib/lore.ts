// Turns a hero's raw journal entry into archetype-voiced lore.
//
// Two producers share this file:
//   • buildSystemPrompt() — the system prompt for the Claude Messages API
//     (used by /api/journal/generate when ANTHROPIC_API_KEY is set).
//   • generateLore() — a deterministic, no-LLM fallback in the spirit of
//     familiar.ts. It never fabricates events; it frames the hero's own words
//     in their archetype's voice.

export interface LoreResult {
  /** In-world retelling of this single entry (the accumulating chronicle). */
  fragment: string;
  /** Short "who this hero has become" blurb shown on the profile. */
  intro: string;
}

interface Voice {
  /** Tone descriptor fed to the LLM system prompt. */
  tone: string;
  /** What this archetype calls its journal/record. */
  chronicle: string;
  /** Opening frames for a template fragment (chosen by a stable hash). */
  openers: string[];
  /** Closing frames for a template fragment. */
  closers: string[];
  /** Standing self-description used to synthesize the template intro. */
  intro: string;
}

// Proper-case keys, matching the Supabase `archetypes` table.
export const ARCHETYPE_VOICE: Record<string, Voice> = {
  Hunter: {
    tone: "a terse, driven monster-hunter's field journal — visceral, focused on the pursuit and the kill, always measuring the distance to the apex",
    chronicle: "the Hunter's log",
    openers: [
      "The Hunter's log records another day on the trail.",
      "Fresh tracks in the dirt. The Hunter set out again.",
      "The hunt does not pause for weariness. Today's quarry:",
    ],
    closers: [
      "Another mark closer to the apex. The trail goes ever on.",
      "The blade stays sharp. Tomorrow, the hunt resumes.",
      "Prey logged, ground gained. The Hunter rests one eye open.",
    ],
    intro:
      "A Hunter whose logbook lengthens with every dawn, forever measuring the distance to the apex.",
  },
  Assassin: {
    tone: "a cold, precise assassin's cipher — clipped, shadowed, every act a contract quietly fulfilled",
    chronicle: "the Assassin's cipher",
    openers: [
      "The cipher notes a contract quietly kept.",
      "In the space between heartbeats, the Assassin moved.",
      "No witnesses. Only the record:",
    ],
    closers: [
      "The mark fades. The shadow moves on.",
      "Clean work. The night keeps its secrets.",
      "One more name struck from the ledger.",
    ],
    intro:
      "An Assassin who leaves no trace but this cipher — each entry a contract with the self, quietly kept.",
  },
  Adventurer: {
    tone: "a bright, wide-eyed adventurer's travel journal — curious, warm, always one horizon further",
    chronicle: "the Adventurer's travel journal",
    openers: [
      "The travel journal gains a new page.",
      "Over the next hill, the Adventurer found today:",
      "The map grows one landmark richer.",
    ],
    closers: [
      "Another horizon claimed. The road calls onward.",
      "The compass never lies — forward, always forward.",
      "Boots dusty, heart full. Tomorrow, further still.",
    ],
    intro:
      "An Adventurer whose map fills with every dawn, forever one horizon further than yesterday.",
  },
  Siren: {
    tone: "a lyrical, enchanting siren's songbook — flowing, tidal, turning ordinary days into verse",
    chronicle: "the Siren's songbook",
    openers: [
      "The songbook takes up a new verse.",
      "The tide carried a melody today:",
      "Sung low over still water, the Siren recorded:",
    ],
    closers: [
      "The song lingers where the tide recedes.",
      "Another verse woven into the endless current.",
      "The water remembers what the world forgets.",
    ],
    intro:
      "A Siren whose songbook swells like the tide, turning each passing day into quiet verse.",
  },
  Cyborg: {
    tone: "a clinical cyborg's diagnostics log — systems telemetry, uptime, optimization, a faint spark of feeling under the metal",
    chronicle: "the Cyborg's diagnostics log",
    openers: [
      "[LOG] New telemetry committed to the core.",
      "Diagnostics captured the day's runtime:",
      "System uptime logged. Input for the cycle:",
    ],
    closers: [
      "Optimization pass complete. Efficiency trending upward.",
      "Data archived. The core hums on.",
      "One iteration better than the last. Reboot at dawn.",
    ],
    intro:
      "A Cyborg whose diagnostics log grows denser each cycle — every entry one optimization closer to ascension.",
  },
  Elf: {
    tone: "an ancient, unhurried elf's scroll — timeless, precise, viewing a single day against the long turning of ages",
    chronicle: "the Elf's ancient scroll",
    openers: [
      "The ancient scroll unfurls a little further.",
      "Against the long turning of ages, today the Elf marked:",
      "Ink meets timeless vellum once more:",
    ],
    closers: [
      "A small thing, and yet the ages remember it.",
      "The forest keeps its slow, patient count.",
      "Another leaf turns. The scroll grows longer still.",
    ],
    intro:
      "An Elf whose scroll lengthens across the ages, measuring each fleeting day against a long and patient memory.",
  },
  Ranker: {
    tone: "a sharp, competitive ranker's ladder report — score-driven, relentless, always climbing toward the top spot",
    chronicle: "the Ranker's ladder report",
    openers: [
      "The ladder report logs another climb.",
      "The Ranker checked the board and got to work:",
      "Points on the line today. The record:",
    ],
    closers: [
      "Rank secured, sights set higher. The climb never stops.",
      "One rung up. The summit is still above.",
      "The board doesn't lie — momentum is everything.",
    ],
    intro:
      "A Ranker whose ladder report tracks a relentless climb, every entry one rung nearer the top spot.",
  },
  Player: {
    tone: "a genre-savvy player's scoreboard — gamer's-eye framing of real life as quests, XP and grind, self-aware and hype",
    chronicle: "the Player's scoreboard",
    openers: [
      "New entry logged to the scoreboard.",
      "The Player booted up the day's run:",
      "Side-quest complete. Log reads:",
    ],
    closers: [
      "XP banked. The grind pays off. GG.",
      "Progress saved. Ready for the next run.",
      "Level's a little closer. On to the next.",
    ],
    intro:
      "A Player treating each day as a run to log — grinding steadily, one saved entry closer to the next level.",
  },
  Traveller: {
    tone: "a contemplative traveller's chronicle — reflective, star-mapped, a wanderer connecting days like constellations",
    chronicle: "the Traveller's chronicle",
    openers: [
      "The chronicle gains another waypoint.",
      "Between one star and the next, the Traveller noted:",
      "A new point charted on the wandering path:",
    ],
    closers: [
      "Another star fixed on the map of the self.",
      "The path winds on; the chronicle keeps pace.",
      "Waypoint logged. The horizon shifts again.",
    ],
    intro:
      "A Traveller whose chronicle connects each day like a constellation, charting a slow path across the self.",
  },
};

const DEFAULT_VOICE: Voice = {
  tone: "an evocative fantasy chronicler recasting an ordinary day as legend",
  chronicle: "the chronicle",
  openers: ["The chronicle records another day."],
  closers: ["And so the legend grows, one page at a time."],
  intro: "A hero whose legend lengthens with every entry.",
};

export function voiceFor(archetypeName: string | null | undefined): Voice {
  return ARCHETYPE_VOICE[archetypeName ?? ""] ?? DEFAULT_VOICE;
}

function interestPhrase(interests: string[]): string {
  const clean = interests.map((t) => t.toLowerCase().trim()).filter(Boolean);
  if (clean.length === 0) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")} and ${clean[clean.length - 1]}`;
}

/** Stable index into `arr` derived from `seed` (so a given entry is consistent). */
function pickStable<T>(arr: T[], seed: string): T {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return arr[Math.abs(h) % arr.length];
}

/**
 * System prompt for the Claude Messages API. Asks for a single JSON object so
 * the route can parse a fragment + refreshed intro in one call.
 */
export function buildSystemPrompt(
  archetypeName: string | null | undefined,
  interests: string[]
): string {
  const v = voiceFor(archetypeName);
  const tastes = interestPhrase(interests);
  return [
    `You are the in-world chronicler for a ${archetypeName ?? "nameless"} hero in an anime-inspired RPG.`,
    `Voice: ${v.tone}.`,
    tastes
      ? `The hero's tastes lean toward ${tastes}; let imagery echo those genres subtly, never as a checklist.`
      : "",
    "The user will send a raw journal entry: a dream, a real event, or a stray thought.",
    "Return ONLY a JSON object with exactly two string keys:",
    `  "fragment": 2-4 sentences retelling THIS entry as in-world lore in the voice above. Stay faithful to what they wrote — reframe, do not invent new events.`,
    `  "intro": 2-3 sentences, third-person, describing who this hero has become given this entry — an intro blurb for their character profile.`,
    "No markdown, no code fences, no commentary outside the JSON.",
  ]
    .filter(Boolean)
    .join("\n");
}

/**
 * Deterministic, no-LLM lore. Frames the hero's own words in their archetype's
 * voice rather than inventing events. Used when no ANTHROPIC_API_KEY is set (or
 * the API call fails).
 */
export function generateLore(
  body: string,
  archetypeName: string | null | undefined,
  interests: string[]
): LoreResult {
  const v = voiceFor(archetypeName);
  const entry = body.trim();
  const opener = pickStable(v.openers, entry);
  const closer = pickStable(v.closers, entry.split("").reverse().join(""));

  const fragment = `${opener}\n\n“${entry}”\n\n${closer}`;

  const tastes = interestPhrase(interests);
  const intro = tastes
    ? `${v.intro} Drawn to ${tastes}, they write their legend one entry at a time.`
    : v.intro;

  return { fragment, intro };
}
