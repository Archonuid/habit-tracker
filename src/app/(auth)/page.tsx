"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, ArrowRight, Sun, Moon, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { ARCHETYPES, FLOATING_CHIPS } from "@/app/lib/constants";
import { RuneOrb } from "@/app/components/auth/RuneOrb";
import { InputField } from "@/app/components/auth/InputField";
import { createClient } from "@/app/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme !== "light";
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const switchMode = (m: "signup" | "login") => {
    setMode(m);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (!form.email.trim() || !form.password) {
      setError("Your sigil address and passphrase are both required.");
      return;
    }
    if (mode === "signup" && !form.name.trim()) {
      setError("The realm must know your chosen name.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: form.email.trim(),
          password: form.password,
          options: {
            data: { name: form.name.trim() },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/archetype`,
          },
        });
        if (error) throw error;
        // Supabase returns a user with no identities when the email is already registered
        if (data.user && data.user.identities?.length === 0) {
          setError("This sigil is already awakened. Return to your realm instead.");
          return;
        }
        if (data.session) {
          router.push("/archetype");
          router.refresh();
        } else {
          setNotice(
            "A confirmation sigil has been sent to your email. Verify it to complete your awakening."
          );
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: form.email.trim(),
          password: form.password,
        });
        if (error) throw error;
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_done")
          .eq("id", data.user.id)
          .single();
        router.push(profile?.onboarding_done ? "/home" : "/archetype");
        router.refresh();
      }
    } catch (err) {
      const raw =
        err instanceof Error ? err.message : String((err as any)?.message ?? "");
      const message =
        raw && raw !== "{}" && raw !== "Failed to fetch"
          ? raw
          : "The ritual failed — the realm's database rejected the summons. Try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const id = setInterval(() => {
      setCurrentIdx((i) => (i + 1) % ARCHETYPES.length);
    }, 2600);
    return () => clearInterval(id);
  }, []);

  const archetype = ARCHETYPES[currentIdx];
  const primaryRgb = isDark ? "124,77,255" : "91,48,214";
  const gridColor = isDark ? "rgba(139,92,246," : "rgba(91,48,214,";

  return (
    <div>
      <div
        className="min-h-screen bg-background text-foreground flex overflow-hidden relative"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Background */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute inset-0 transition-all duration-500"
            style={{
              background: isDark
                ? "radial-gradient(ellipse 70% 70% at 28% 50%, rgba(109,40,217,0.1) 0%, transparent 65%)"
                : "radial-gradient(ellipse 70% 70% at 28% 50%, rgba(91,48,214,0.07) 0%, transparent 65%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              opacity: isDark ? 0.025 : 0.06,
              backgroundImage: `linear-gradient(${gridColor}1) 1px, transparent 1px), linear-gradient(90deg, ${gridColor}1) 1px, transparent 1px)`,
              backgroundSize: "56px 56px",
            }}
          />
          <div
            className="absolute w-full h-px"
            style={{
              top: "50%",
              background: `linear-gradient(90deg, transparent, ${gridColor}0.07) 30%, ${gridColor}0.07) 70%, transparent)`,
            }}
          />
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(isDark ? "light" : "dark")}
          className="fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-sm border border-border bg-card/70 text-muted-foreground hover:text-foreground transition-all duration-200 backdrop-blur-sm"
          title="Toggle theme"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isDark ? "moon" : "sun"}
              initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
              transition={{ duration: 0.2 }}
            >
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </motion.div>
          </AnimatePresence>
        </button>

        {/* ── LEFT atmospheric panel ── */}
        <div className="hidden lg:flex flex-col items-center justify-center flex-[1.1] relative z-10 px-8 py-16">
          {/* Floating archetype chips */}
          {FLOATING_CHIPS.map((chip, i) => (
            <motion.div
              key={chip.name}
              className="absolute text-[10px] tracking-[0.22em] px-2.5 py-1 rounded-sm cursor-default"
              style={{
                top: chip.top,
                left: chip.left,
                right: chip.right,
                fontFamily: "'JetBrains Mono', monospace",
                color: chip.color,
                border: `1px solid ${chip.color}30`,
                background: `${chip.color}${isDark ? "08" : "12"}`,
              }}
              animate={{ opacity: [0.35, 0.65, 0.35], y: [0, -7, 0] }}
              transition={{
                duration: 4 + i * 0.4,
                delay: i * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              {chip.name}
            </motion.div>
          ))}

          {/* Main content */}
          <div className="relative z-10 flex flex-col items-center gap-10 max-w-xs w-full">
            <RuneOrb archetype={archetype} isDark={isDark} />

            <div className="text-center space-y-2">
              <h1
                className="text-5xl font-bold tracking-[0.35em] text-foreground/90"
                style={{ fontFamily: "'Cinzel', serif" }}
              >
                MYTHLOG
              </h1>
              <p
                className="text-[10px] tracking-[0.3em] text-muted-foreground"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                LIFE ROLEPLAY SYSTEM
              </p>
            </div>

            <p className="text-center text-sm leading-relaxed max-w-[240px] text-muted-foreground">
              Your habits become quests.
              <br />
              Your days become lore.
              <br />
              <span className="text-accent">Your life becomes the legend.</span>
            </p>
          </div>
        </div>

        {/* Vertical divider */}
        <div
          className="hidden lg:block w-px flex-shrink-0 my-16 z-10"
          style={{
            background: `linear-gradient(to bottom, transparent, ${gridColor}0.28) 25%, ${gridColor}0.28) 75%, transparent)`,
          }}
        />

        {/* ── RIGHT form panel ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative z-10 min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-10 space-y-1.5">
            <h1
              className="text-4xl font-bold tracking-[0.35em] text-foreground/90"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              MYTHLOG
            </h1>
            <p
              className="text-[9px] tracking-[0.3em] text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              LIFE ROLEPLAY SYSTEM
            </p>
          </div>

          <div className="w-full max-w-[360px] space-y-7">
            {/* Mode toggle */}
            <div className="flex rounded-sm overflow-hidden p-[3px] border border-border bg-card/60">
              {(["signup", "login"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className="flex-1 py-2.5 text-[10px] tracking-[0.22em] uppercase transition-all duration-200 rounded-sm"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    background:
                      mode === m
                        ? `rgba(${primaryRgb},0.15)`
                        : "transparent",
                    color:
                      mode === m
                        ? "var(--accent)"
                        : "var(--muted-foreground)",
                    border:
                      mode === m
                        ? `1px solid rgba(${primaryRgb},0.38)`
                        : "1px solid transparent",
                  }}
                >
                  {m === "signup" ? "AWAKEN" : "RETURN"}
                </button>
              ))}
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.22 }}
                className="space-y-6"
              >
                <div className="space-y-1.5">
                  <h2
                    className="text-xl font-semibold tracking-wider text-foreground"
                    style={{ fontFamily: "'Cinzel', serif" }}
                  >
                    {mode === "signup"
                      ? "Begin Your Legend"
                      : "Welcome Back, Hero"}
                  </h2>
                  <p
                    className="text-[11px] tracking-widest text-muted-foreground"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {mode === "signup"
                      ? "Your archetype awaits. Choose wisely."
                      : "Your quest log continues where you left off."}
                  </p>
                </div>

                <div className="space-y-4">
                  {mode === "signup" && (
                    <InputField
                      label="Chosen Name"
                      type="text"
                      placeholder="What shall the realm call you?"
                      value={form.name}
                      onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                      isDark={isDark}
                    />
                  )}
                  <InputField
                    label="Sigil Address"
                    type="email"
                    placeholder="your@realm.com"
                    value={form.email}
                    onChange={(v) => setForm((f) => ({ ...f, email: v }))}
                    isDark={isDark}
                  />
                  <InputField
                    label="Secret Passphrase"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={form.password}
                    onChange={(v) => setForm((f) => ({ ...f, password: v }))}
                    isDark={isDark}
                    suffix={
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                    }
                  />
                </div>

                {mode === "login" && (
                  <div className="text-right">
                    <button
                      type="button"
                      className="text-[11px] text-muted-foreground hover:text-accent transition-colors"
                      style={{ fontFamily: "'JetBrains Mono', monospace" }}
                    >
                      Forgot passphrase?
                    </button>
                  </div>
                )}

                {/* Error / notice */}
                {(error || notice) && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-[11px] leading-relaxed px-3 py-2.5 rounded-sm border"
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      color: error ? "#f87171" : "var(--accent)",
                      borderColor: error
                        ? "rgba(248,113,113,0.35)"
                        : `color-mix(in srgb, var(--accent) 35%, transparent)`,
                      background: error
                        ? "rgba(248,113,113,0.06)"
                        : `color-mix(in srgb, var(--accent) 6%, transparent)`,
                    }}
                  >
                    {error ?? notice}
                  </motion.p>
                )}

                {/* CTA */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    letterSpacing: "0.22em",
                    background: isDark
                      ? "linear-gradient(135deg, rgba(124,77,255,0.75) 0%, rgba(90,40,220,0.9) 100%)"
                      : "linear-gradient(135deg, rgba(91,48,214,0.88) 0%, rgba(68,28,180,0.96) 100%)",
                    border: `1px solid rgba(${primaryRgb},0.55)`,
                    color: "#f0ecff",
                    boxShadow: `0 0 24px rgba(${primaryRgb},${isDark ? "0.18" : "0.14"}), inset 0 1px 0 rgba(255,255,255,0.06)`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 36px rgba(${primaryRgb},0.35), inset 0 1px 0 rgba(255,255,255,0.06)`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = `0 0 24px rgba(${primaryRgb},${isDark ? "0.18" : "0.14"}), inset 0 1px 0 rgba(255,255,255,0.06)`;
                  }}
                >
                  <span className="uppercase tracking-[0.22em]">
                    {loading
                      ? mode === "signup"
                        ? "Awakening..."
                        : "Entering..."
                      : mode === "signup"
                        ? "Awaken"
                        : "Enter the Realm"}
                  </span>
                  {loading ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <ArrowRight size={14} />
                  )}
                </button>

                {/* Switch mode */}
                <p
                  className="text-center text-[11px] text-muted-foreground"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {mode === "signup" ? (
                    <>
                      Already awakened?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("login")}
                        className="text-primary hover:text-accent transition-colors"
                      >
                        Return to your realm
                      </button>
                    </>
                  ) : (
                    <>
                      No legend yet?{" "}
                      <button
                        type="button"
                        onClick={() => switchMode("signup")}
                        className="text-primary hover:text-accent transition-colors"
                      >
                        Begin your awakening
                      </button>
                    </>
                  )}
                </p>
              </motion.form>
            </AnimatePresence>

            {/* Archetype hint — signup only */}
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.25, delay: 0.1 }}
                  className="rounded-sm p-4 space-y-2 border border-border bg-card/30"
                  style={{
                    borderColor: `color-mix(in srgb, var(--accent) 25%, transparent)`,
                    background: `color-mix(in srgb, var(--accent) 5%, transparent)`,
                  }}
                >
                  <p
                    className="text-[10px] tracking-[0.18em] uppercase text-accent"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    ◈ After Awakening
                  </p>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Choose your archetype — Hunter, Assassin, Adventurer, Siren,
                    Cyborg, Elf, Ranker, and more. Your entire interface —
                    language, lore, quest style — shifts to match your class.
                  </p>
                  <div className="flex gap-1.5 pt-1 flex-wrap">
                    {ARCHETYPES.map((a) => (
                      <div
                        key={a.name}
                        title={a.name}
                        className="w-5 h-5 rounded-sm cursor-default transition-all duration-150"
                        style={{
                          background: `${a.color}22`,
                          border: `1px solid ${a.color}50`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = `${a.color}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = `${a.color}22`;
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p
            className="absolute bottom-6 text-[10px] tracking-[0.18em] text-center text-muted-foreground/40"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            BUILT FOR THOSE WHO REFUSE TO BE ORDINARY
          </p>
        </div>
      </div>
    </div>
  );
}
