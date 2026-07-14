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
}

export interface FamiliarRow {
  id: string;
  user_id: string;
  name: string;
  animal_type: "cat" | "dog" | null;
  personality: string | null;
}

export interface Habit {
  id: string;
  user_id: string;
  title: string;
  xp_reward: number;
  is_active: boolean | null;
  created_at: string;
}

/** Everything the app needs to render the signed-in hero. */
export interface Hero {
  profile: Profile;
  archetype: ArchetypeRow | null;
  familiar: FamiliarRow | null;
  interests: string[];
}
