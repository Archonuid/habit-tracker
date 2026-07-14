"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { INTEREST_TAGS } from "@/app/lib/constants";
import { createClient } from "@/app/lib/supabase/client";
import { OnboardingShell } from "@/app/components/onboarding/OnboardingShell";

export default function InterestsPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggle = (name: string) =>
    setSelected((prev) =>
      prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]
    );

  const handleNext = async () => {
    if (selected.length === 0) return;
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
    // Replace any previous tags, then mark onboarding complete.
    const { error: deleteError } = await supabase
      .from("user_interests")
      .delete()
      .eq("user_id", user.id);
    const { error: insertError } = deleteError
      ? { error: deleteError }
      : await supabase
          .from("user_interests")
          .insert(selected.map((tag) => ({ user_id: user.id, tag })));
    const { error: profileError } = insertError
      ? { error: insertError }
      : await supabase
          .from("profiles")
          .update({ onboarding_done: true })
          .eq("id", user.id);
    setLoading(false);
    const error = deleteError ?? insertError ?? profileError;
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/home");
    router.refresh();
  };

  return (
    <OnboardingShell
      step={4}
      title="DECLARE YOUR INTERESTS"
      subtitle="The genres that fuel your legend"
      onNext={handleNext}
      nextDisabled={selected.length === 0}
      nextLabel="COMPLETE AWAKENING"
      loading={loading}
      error={error}
    >
      <div className="flex flex-wrap justify-center gap-2.5 max-w-lg">
        {INTEREST_TAGS.map((tag, i) => {
          const isSelected = selected.includes(tag.name);
          return (
            <motion.button
              key={tag.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.035 }}
              onClick={() => toggle(tag.name)}
              className="px-4 py-2 rounded-sm border text-[10px] tracking-[0.18em] transition-all duration-150 hover:scale-[1.05]"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: tag.color,
                background: isSelected ? `${tag.color}26` : `${tag.color}0a`,
                borderColor: isSelected ? tag.color : `${tag.color}35`,
                boxShadow: isSelected ? `0 0 18px ${tag.color}30` : "none",
              }}
            >
              {tag.name}
            </motion.button>
          );
        })}
      </div>
      <p
        className="text-[10px] tracking-[0.15em] text-muted-foreground/60 -mt-2"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {selected.length === 0
          ? "PICK AT LEAST ONE"
          : `${selected.length} SELECTED`}
      </p>
    </OnboardingShell>
  );
}
