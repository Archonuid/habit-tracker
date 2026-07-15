"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import type { ArchetypeRow, FamiliarRow, Hero, Profile } from "@/app/lib/types";

/**
 * Loads everything about the signed-in hero: profile (+ archetype lore
 * terms), familiar, and interests. Redirects to the auth page if signed out,
 * and to onboarding if the profile isn't complete yet.
 */
export function useHero({ requireOnboarded = true } = {}) {
  const router = useRouter();
  const [hero, setHero] = useState<Hero | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/");
        return;
      }

      const [profileRes, familiarRes, interestsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("*, archetypes(*)")
          .eq("id", user.id)
          .single(),
        supabase.from("familiars").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("user_interests").select("tag").eq("user_id", user.id),
      ]);

      if (cancelled) return;
      const profileRow = profileRes.data;
      if (!profileRow) {
        router.replace("/");
        return;
      }
      if (requireOnboarded && !profileRow.onboarding_done) {
        router.replace("/archetype");
        return;
      }

      const { archetypes, ...profile } = profileRow;
      setHero({
        profile: profile as Profile,
        archetype: (archetypes as ArchetypeRow | null) ?? null,
        familiar: (familiarRes.data as FamiliarRow | null) ?? null,
        interests: (interestsRes.data ?? []).map((r) => r.tag as string),
      });
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [router, requireOnboarded]);

  /** Update XP/level locally after completing a quest. */
  const setStats = (current_xp: number, level: number) =>
    setHero((h) =>
      h ? { ...h, profile: { ...h.profile, current_xp, level } } : h
    );

  /** Merge partial profile changes (username, archetype_id …). */
  const patchProfile = (p: Partial<Profile>) =>
    setHero((h) => (h ? { ...h, profile: { ...h.profile, ...p } } : h));

  /** Swap the archetype row (lore terms) after a change. */
  const setArchetype = (archetype: ArchetypeRow | null) =>
    setHero((h) => (h ? { ...h, archetype } : h));

  /** Merge partial familiar changes (name, personality, animal). */
  const patchFamiliar = (f: Partial<FamiliarRow>) =>
    setHero((h) =>
      h && h.familiar ? { ...h, familiar: { ...h.familiar, ...f } } : h
    );

  return { hero, setStats, patchProfile, setArchetype, patchFamiliar, loading };
}
