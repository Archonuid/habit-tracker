"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import {
  PERSONALITIES,
  archetypeStyle,
  sigilKey,
  sigilTerm,
} from "@/app/lib/constants";
import { createClient } from "@/app/lib/supabase/client";
import { OnboardingShell } from "@/app/components/onboarding/OnboardingShell";
import { Sigil } from "@/app/components/sigil/Sigil";

export default function SigilPage() {
  const router = useRouter();
  const [archetypeName, setArchetypeName] = useState<string | null>(null);
  const [fetching, setFetching] = useState(true);
  const [name, setName] = useState("");
  const [personality, setPersonality] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The sigil is bound to the archetype chosen a step earlier — load it.
  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/");
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("archetypes(name)")
        .eq("id", user.id)
        .single();
      const arch =
        (data?.archetypes as unknown as { name: string } | null)?.name ?? null;
      setArchetypeName(arch);
      setFetching(false);
    })();
  }, [router]);

  const term = sigilTerm(archetypeName);
  const style = archetypeStyle(archetypeName);
  const ready = name.trim().length >= 2 && !!personality;

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
      title={`AWAKEN YOUR ${term.toUpperCase()}`}
      subtitle="Your companion and chronicler"
      onNext={handleNext}
      nextDisabled={!ready}
      loading={loading}
      error={error}
    >
      {fetching ? (
        <Loader2 className="animate-spin text-muted-foreground" size={22} />
      ) : (
        <div className="w-full max-w-md space-y-7">
          {/* Sigil preview — bound to the chosen archetype */}
          <div className="flex flex-col items-center gap-2">
            <div
              className="rounded-full p-2"
              style={{
                border: `1px solid ${style.color}35`,
                boxShadow: `0 0 40px ${style.color}20`,
              }}
            >
              <Sigil archetype={sigilKey(archetypeName)} streak={6} level={1} size={150} />
            </div>
            <p
              className="text-[9px] tracking-[0.24em] uppercase text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Your {archetypeName ?? "Hero"}&apos;s {term}
            </p>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <label
              className="block text-[10px] tracking-[0.22em] uppercase text-accent"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {term}&apos;s Name
            </label>
            <input
              type="text"
              placeholder={`Name your ${term.toLowerCase()}…`}
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
      )}
    </OnboardingShell>
  );
}
