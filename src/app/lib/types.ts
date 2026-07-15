export interface ArchetypeRow {
  id: string;
  name: string;
  status_term: string;
  task_term: string;
  xp_term: string;
  level_term: string;
  ui_theme: string;
}

export interface Profile {
  id: string;
  username: string | null;
  archetype_id: string | null;
  onboarding_done: boolean;
  level: number;
  current_xp: number;
  /** Short synthesized "who this hero has become" blurb (from journal lore). */
  lore_intro?: string | null;
  /** Whether lore_intro is visible on the hero's public profile card. */
  lore_public?: boolean;
}

export interface FamiliarRow {
  id: string;
  user_id: string;
  /** The sigil's given name (the companion is now an archetype-bound sigil). */
  name: string;
  /** Legacy cat/dog column — no longer used; kept nullable for old rows. */
  animal_type?: string | null;
  personality: string | null;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  /** The hero's raw entry (dream, event, anything). */
  body: string;
  /** The generated in-world lore retelling of this entry. */
  lore: string | null;
  created_at: string;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  xp_reward: number;
  is_active: boolean | null;
  is_paused: boolean | null;
  archived_at: string | null;
  /** JS getDay() convention (0=Sun … 6=Sat). null/empty = every day. */
  weekdays: number[] | null;
  created_at: string;
}

export interface HabitCompletion {
  habit_id: string;
  completed_on: string; // 'YYYY-MM-DD'
  xp_granted: number;
}

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  xp_reward: number;
  done: boolean;
  done_on: string | null;
  created_at: string;
}

/** Everything the app needs to render the signed-in hero. */
export interface Hero {
  profile: Profile;
  archetype: ArchetypeRow | null;
  familiar: FamiliarRow | null;
  interests: string[];
}
