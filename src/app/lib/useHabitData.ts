"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import type { Habit, HabitCompletion } from "@/app/lib/types";

/** Fetches the signed-in user's habits + completion history (RLS-scoped). */
export function useHabitData() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    (async () => {
      const [habitsRes, compsRes] = await Promise.all([
        supabase.from("habits").select("*"),
        supabase
          .from("habit_completions")
          .select("habit_id, completed_on, xp_granted"),
      ]);
      if (cancelled) return;
      setHabits((habitsRes.data as Habit[]) ?? []);
      setCompletions((compsRes.data as HabitCompletion[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { habits, completions, loading };
}
