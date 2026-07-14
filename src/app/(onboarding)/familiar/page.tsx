"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { PERSONALITIES } from "@/app/lib/constants";
import { createClient } from "@/app/lib/supabase/client";
import { OnboardingShell } from "@/app/components/onboarding/OnboardingShell";

const SPECIES = [
  { id: "cat", label: "CAT", emoji: "🐈‍⬛", tagline: "Judges you. Helps anyway." },
  { id: "dog", label: "DOG", emoji: "🐕", tagline: "Believes in you. Always." },
] as const;

export default function FamiliarPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [species, setSpecies] = useState<"cat" | "dog" | null>(null);
  const [personality, setPersonality] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ready = name.trim().length >= 2 && species && personality;

  const handleNext = async () => {
    if (!ready) return;
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
    const { error } = await supabase.from("familiars").upsert(
      {
        user_id: user.id,
        name: name.trim(),
        animal_type: species,
        personality,
      },
      { onConflict: "user_id" }
    );
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/interests");
  };

  return (
    <OnboardingShell
      step={3}
      title="SUMMON YOUR FAMILIAR"
      subtitle="Your companion and chronicler"
      onNext={handleNext}
      nextDisabled={!ready}
      loading={loading}
      error={error}
    >
      <div className="w-full max-w-md space-y-7">
        {/* Species */}
        <div className="grid grid-cols-2 gap-3">
          {SPECIES.map((s) => {
            const isSelected = species === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setSpecies(s.id)}
                className="rounded-sm border p-5 text-center space-y-1.5 transition-all duration-150 hover:scale-[1.02]"
                style={{
                  background: isSelected
                    ? "rgba(124,77,255,0.16)"
                    : "rgba(124,77,255,0.05)",
                  borderColor: isSelected
                    ? "rgba(124,77,255,0.7)"
                    : "var(--border)",
                  boxShadow: isSelected
                    ? "0 0 24px rgba(124,77,255,0.2)"
                    : "none",
                }}
              >
                <div className="text-3xl">{s.emoji}</div>
                <div
                  className="text-xs font-bold tracking-[0.2em]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  {s.label}
                </div>
                <div
                  className="text-[9px] tracking-[0.1em] uppercase text-muted-foreground"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {s.tagline}
                </div>
              </button>
            );
          })}
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <label
            className="block text-[10px] tracking-[0.22em] uppercase text-accent"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Familiar&apos;s Name
          </label>
          <input
            type="text"
            placeholder="Name your companion…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={24}
            className="w-full px-4 py-3 text-sm bg-card/50 rounded-sm outline-none border border-border focus:border-primary/60 transition-colors"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          />
        </div>

        {/* Personality */}
        <div className="space-y-2">
          <label
            className="block text-[10px] tracking-[0.22em] uppercase text-accent"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            Personality
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {PERSONALITIES.map((p, i) => {
              const isSelected = personality === p.id;
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setPersonality(p.id)}
                  className="rounded-sm border p-3 text-center space-y-1 transition-all duration-150 hover:scale-[1.03]"
                  style={{
                    background: isSelected ? `${p.color}22` : `${p.color}08`,
                    borderColor: isSelected ? p.color : `${p.color}30`,
                    boxShadow: isSelected ? `0 0 20px ${p.color}28` : "none",
                  }}
                >
                  <div
                    className="text-[11px] font-bold tracking-[0.16em]"
                    style={{ fontFamily: "'Cinzel', serif", color: p.color }}
                  >
                    {p.name}
                  </div>
                  <div className="text-[9px] leading-relaxed text-muted-foreground">
                    {p.tagline}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    </OnboardingShell>
  );
}
