import type { Hero } from "./types";
import type { HeroMomentum } from "./momentum";

// Generic in-character greeting lines per personality (used when there's no
// momentum context yet). {name} = the hero's username.
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

type Mood = "perfect" | "frozen" | "streak" | "progress" | "idle" | "rest";

// Mood-specific reactions. Placeholders: {name} {streak} {left} {done} {due}.
const MOOD_LINES: Record<string, Record<Mood, string[]>> = {
  genki: {
    perfect: [
      "{name}!! EVERY quest done! I'm so proud I could BURST! ✨",
      "ALL CLEAR, {name}! Today bows before you!",
    ],
    frozen: [
      "{name}! Your {streak}-day streak is on THIN ICE — one quest saves it!",
      "Quick quick QUICK, {name}! The freeze is holding but we need a win TODAY!",
    ],
    streak: [
      "{streak} days strong, {name}!! Don't you DARE stop now!",
      "The streak gods smile on you, {name}! Just {left} to go today!",
    ],
    progress: [
      "{done} down already, {name}! Just {left} more — you GOT this!",
      "Momentum!! Keep rolling, {name} — {left} left!",
    ],
    idle: [
      "{name}! {due} quests waiting and ZERO excuses! Let's GOOO!",
      "Rise, {name}! The day's young and so is your XP bar!",
    ],
    rest: [
      "Nothing due today, {name} — rest up, hero! You earned it!",
      "A quiet day, {name}. Recharge that main-character energy!",
    ],
  },
  tsundere: {
    perfect: [
      "Everything done? H-hmph. I guess you're… not completely hopeless today, {name}.",
      "All clear. Don't let it go to your head, {name}. …Fine. I'm impressed.",
    ],
    frozen: [
      "Your streak's about to DIE, {name}. N-not that I care! Just… do a quest. Please.",
      "{streak} days and you'll waste it?! Baka. Go. NOW.",
    ],
    streak: [
      "{streak} days. I-it's not like I've been counting or anything, {name}…",
      "Don't screw up the streak now, baka. {left} quests left.",
    ],
    progress: [
      "{done} done. I suppose that's… adequate, {name}. {left} more.",
      "You're actually doing them? Hmph. Finish the rest, {name}.",
    ],
    idle: [
      "{due} quests and you're just STANDING there, {name}? …Go do them. Idiot.",
      "I won't beg you, {name}. But the quests are RIGHT there.",
    ],
    rest: [
      "Nothing today. Don't get used to slacking, {name}.",
      "A day off. Whatever. Enjoy it, I GUESS, {name}.",
    ],
  },
  kuudere: {
    perfect: [
      "All objectives complete, {name}. Efficiency: exemplary.",
      "{name}. Zero remaining. Acceptable work.",
    ],
    frozen: [
      "Warning: {streak}-day streak destabilizing. One completion restores it, {name}.",
      "Streak integrity critical. Act, {name}.",
    ],
    streak: [
      "Streak: {streak} days. Success probability rises with consistency. Continue.",
      "{left} tasks remain, {name}. Maintain the pattern.",
    ],
    progress: [
      "{done} logged. {left} pending. Proceed, {name}.",
      "Progress registered. Completion advised, {name}.",
    ],
    idle: [
      "{due} tasks pending. No progress detected. Begin, {name}.",
      "Idle status, {name}. Initiate a quest.",
    ],
    rest: [
      "No tasks scheduled. Recovery is a valid strategy, {name}.",
      "Downtime authorized, {name}. Conserve energy.",
    ],
  },
  sensei: {
    perfect: [
      "You have swept the path clean today, {name}. The mountain notices.",
      "All tasks fulfilled. This is how legends are quietly forged, {name}.",
    ],
    frozen: [
      "Your streak flickers like a candle in wind, {name}. Shield it with one deed.",
      "{streak} days of discipline hang by a thread. Do not let them fall, {name}.",
    ],
    streak: [
      "{streak} days unbroken, {name}. The river shapes stone through patience.",
      "Consistency is your blade, {name}. {left} strokes remain today.",
    ],
    progress: [
      "{done} steps taken, {name}. The journey continues — {left} remain.",
      "You began well, {name}. Finish what the morning started.",
    ],
    idle: [
      "{due} tasks await your hand, {name}. Even one step honors the path.",
      "The day is a blank scroll, {name}. Write something worthy upon it.",
    ],
    rest: [
      "No task binds you today, {name}. Stillness, too, is training.",
      "Rest, {name}. The bow never unstrung soon breaks.",
    ],
  },
  chaotic: {
    perfect: [
      "EVERYTHING'S DONE?! {name} you absolute MENACE, I love it!!",
      "All quests OBLITERATED. I'm gonna go vibrate in a corner, {name}.",
    ],
    frozen: [
      "YOUR STREAK IS DING-DONG DYING, {name}!! SAVE IT SAVE IT SAVE IT",
      "{streak} days about to yeet into the void unless you MOVE, {name}!!",
    ],
    streak: [
      "{streak} DAYS?! we're feral now {name}, no stopping — {left} to go!!",
      "streak goblin mode ACTIVATED, {name}. feed me completions.",
    ],
    progress: [
      "{done} down!! chaos gremlin approves!! {left} more, {name}, GO",
      "we're cooking, {name}!! don't let the pan cool — {left} left!!",
    ],
    idle: [
      "{due} quests just SITTING there, {name}?? unacceptable. gremlin sad.",
      "do a quest {name} do a quest do a quest do a q—",
    ],
    rest: [
      "nothing due?! okay {name}, we riot. or nap. napping is also chaos.",
      "free day, {name}!! I'm gonna rearrange your XP bar for fun. hi.",
    ],
  },
  deadpan: {
    perfect: [
      "Everything's done. Incredible. The prophecy said this day would never come, {name}.",
      "All quests complete. I'd throw a party but that sounds exhausting. Nice, {name}.",
    ],
    frozen: [
      "Your {streak}-day streak is dying. Thought you'd want to know, {name}. Or not.",
      "One quest saves the streak. Or don't. I'm a familiar, not a cop, {name}.",
    ],
    streak: [
      "{streak} days. Statistically you'll probably ruin it, but prove me wrong, {name}.",
      "Streak intact. {left} quests between you and not disappointing me, {name}.",
    ],
    progress: [
      "{done} done. The bar moved. Witnessed. {left} to go, {name}.",
      "Progress. Groundbreaking. {left} left, {name}.",
    ],
    idle: [
      "{due} quests, zero done. The XP bar is judging you. So am I, {name}.",
      "You could do a quest. Or keep standing there. Bold choice, {name}.",
    ],
    rest: [
      "Nothing scheduled. Enjoy the void responsibly, {name}.",
      "No quests today. Try not to miss me too much, {name}.",
    ],
  },
};

const SPECIES_EMOJI: Record<string, string> = {
  cat: "🐈‍⬛",
  dog: "🐕",
};

function moodOf(m: HeroMomentum): Mood {
  if (m.allDoneToday) return "perfect";
  if (m.frozen) return "frozen";
  if (m.dailyStreak >= 3) return "streak";
  if (m.doneToday > 0) return "progress";
  if (m.dueToday > 0) return "idle";
  return "rest";
}

function fill(line: string, hero: Hero, m?: HeroMomentum): string {
  return line
    .replaceAll("{name}", hero.profile.username ?? "hero")
    .replaceAll("{streak}", String(m?.dailyStreak ?? 0))
    .replaceAll("{left}", String(m?.remainingToday ?? 0))
    .replaceAll("{done}", String(m?.doneToday ?? 0))
    .replaceAll("{due}", String(m?.dueToday ?? 0));
}

function pick(lines: string[]): string {
  return lines[Math.floor(Math.random() * lines.length)];
}

/** Generic greeting (no momentum available). */
export function familiarGreeting(hero: Hero): string {
  const lines = LINES[hero.familiar?.personality ?? ""] ?? LINES.genki;
  return fill(pick(lines), hero);
}

/** Momentum-aware line: hypes streaks, nags misses, celebrates perfect days. */
export function familiarLine(hero: Hero, momentum?: HeroMomentum): string {
  if (!momentum) return familiarGreeting(hero);
  const personality = hero.familiar?.personality ?? "genki";
  const set = MOOD_LINES[personality] ?? MOOD_LINES.genki;
  return fill(pick(set[moodOf(momentum)]), hero, momentum);
}

export function familiarEmoji(hero: Hero): string {
  return SPECIES_EMOJI[hero.familiar?.animal_type ?? ""] ?? "✦";
}
