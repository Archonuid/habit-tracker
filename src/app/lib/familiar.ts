import type { Hero } from "./types";

// In-character greeting lines per personality. {name} = the hero's username.
const LINES: Record<string, string[]> = {
  genki: [
    "{name}!! You're HERE! Today's quests don't stand a CHANCE!",
    "Rise and shine, {name}! Your legend won't write itself — let's GO!",
    "I've been waiting ALL DAY! Okay it's been ten minutes. LET'S QUEST, {name}!",
  ],
  tsundere: [
    "Oh. You showed up, {name}. I-it's not like I was waiting or anything…",
    "Hmph. I suppose your quest log needs attention. Don't expect me to cheer.",
    "You'd better complete something today, {name}. Not for me! For… reasons.",
  ],
  kuudere: [
    "{name}. Status nominal. Quests pending. Begin when ready.",
    "You have returned. Efficiency is expected today, {name}.",
    "Observation: heroes who complete quests level faster. Act accordingly.",
  ],
  sensei: [
    "Ah, {name}. The journey of a thousand levels begins with a single quest.",
    "A sharpened blade rusts without use, {name}. Your quests await.",
    "Patience, {name}. Even the smallest habit moves mountains in time.",
  ],
  chaotic: [
    "{name}!! I reorganized your quest log. By VIBES. You're welcome.",
    "Let's speedrun your habits today, {name}. Any% no-sleep glitchless.",
    "I bit your XP bar while you were gone. It's fine. Probably. Hi {name}!",
  ],
  deadpan: [
    "Oh good. {name} logged in. The realm trembles. Or shrugs. Hard to tell.",
    "Your quests are still there, {name}. They didn't complete themselves. I checked.",
    "Welcome back, {name}. Try not to make the XP bar cry today.",
  ],
};

const SPECIES_EMOJI: Record<string, string> = {
  cat: "🐈‍⬛",
  dog: "🐕",
};

export function familiarGreeting(hero: Hero): string {
  const lines = LINES[hero.familiar?.personality ?? ""] ?? LINES.genki;
  const line = lines[Math.floor(Math.random() * lines.length)];
  return line.replaceAll("{name}", hero.profile.username ?? "hero");
}

export function familiarEmoji(hero: Hero): string {
  return SPECIES_EMOJI[hero.familiar?.animal_type ?? ""] ?? "✦";
}
