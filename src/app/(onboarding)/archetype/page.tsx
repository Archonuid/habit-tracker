"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import { archetypeStyle } from "@/app/lib/constants";
import { createClient } from "@/app/lib/supabase/client";
import { OnboardingShell } from "@/app/components/onboarding/OnboardingShell";
import type { ArchetypeRow } from "@/app/lib/types";

export default function ArchetypePage() {
  const router = useRouter();
  const [archetypes, setArchetypes] = useState<ArchetypeRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [selected, setSelected] = useState<ArchetypeRow | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("archetypes")
      .select("*")
      .order("name")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        setArchetypes((data as ArchetypeRow[]) ?? []);
        setFetching(false);
      });
  }, []);

  const handleNext = async () => {
    if (!selected) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/");
      return;
    }
    const { error } = await supabase
      .from("profiles")
      .update({ archetype_id: selected.id })
      .eq("id", user.id);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/username");
  };

  return (
    <OnboardingShell
      step={1}
      title="CHOOSE YOUR ARCHETYPE"
      subtitle="Your class shapes your legend"
      onNext={handleNext}
      nextDisabled={!selected}
      loading={loading}
      error={error}
    >
      {fetching ? (
        <Loader2 className="animate-spin text-muted-foreground" size={22} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
          {archetypes.map((a, i) => {
            const style = archetypeStyle(a.name);
            const isSelected = selected?.id === a.id;
            return (
              <motion.button
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(a)}
                className="rounded-sm border p-4 text-center space-y-1.5 transition-all duration-150 hover:scale-[1.03]"
                style={{
                  background: isSelected ? `${style.color}28` : `${style.color}10`,
                  borderColor: isSelected ? style.color : `${style.color}35`,
                  boxShadow: isSelected ? `0 0 24px ${style.color}30` : "none",
                }}
              >
                <div
                  className="text-sm font-bold tracking-[0.18em] uppercase"
                  style={{ fontFamily: "'Cinzel', serif", color: style.color }}
                >
                  {a.name}
                </div>
                <div
                  className="text-[9px] tracking-[0.12em] uppercase text-muted-foreground"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {style.tagline}
                </div>
                <div
                  className="text-[8px] tracking-[0.1em] uppercase text-muted-foreground/60"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {a.status_term} · {a.task_term}s · {a.xp_term}
                </div>
              </motion.button>
            );
          })}
        </div>
      )}
    </OnboardingShell>
  );
}
