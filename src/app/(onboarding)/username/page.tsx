"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/app/lib/supabase/client";
import { OnboardingShell } from "@/app/components/onboarding/OnboardingShell";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export default function UsernamePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid = USERNAME_RE.test(username);

  const handleNext = async () => {
    if (!valid) return;
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
      .update({ username })
      .eq("id", user.id);
    setLoading(false);
    if (error) {
      setError(
        error.code === "23505"
          ? "That name is already claimed by another hero. Choose another."
          : error.message
      );
      return;
    }
    router.push("/familiar");
  };

  return (
    <OnboardingShell
      step={2}
      title="CLAIM YOUR NAME"
      subtitle="How the realm shall know you"
      onNext={handleNext}
      nextDisabled={!valid}
      loading={loading}
      error={error}
    >
      <div className="w-full max-w-sm space-y-2">
        <input
          type="text"
          placeholder="What shall the realm call you?"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && valid && !loading) handleNext();
          }}
          autoFocus
          maxLength={20}
          className="w-full px-4 py-3 text-sm text-center bg-card/50 rounded-sm outline-none border border-border focus:border-primary/60 transition-colors"
          style={{ fontFamily: "'Outfit', sans-serif", letterSpacing: "0.08em" }}
        />
        <p
          className="text-[10px] text-center text-muted-foreground/60 tracking-[0.15em]"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          3–20 CHARACTERS · LETTERS, NUMBERS, UNDERSCORES
        </p>
      </div>
    </OnboardingShell>
  );
}
