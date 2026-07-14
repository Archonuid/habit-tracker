"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowRight, Loader2 } from "lucide-react";

export function OnboardingShell({
  step,
  title,
  subtitle,
  children,
  onNext,
  nextLabel = "CONTINUE",
  nextDisabled = false,
  loading = false,
  error,
}: {
  step: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  error?: string | null;
}) {
  return (
    <div className="dark">
      <main
        className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center gap-8 px-6 py-16 relative overflow-hidden"
        style={{ fontFamily: "'Outfit', sans-serif" }}
      >
        {/* Ambient background */}
        <div
          className="fixed inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 0%, rgba(109,40,217,0.12) 0%, transparent 65%)",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="relative z-10 w-full max-w-2xl flex flex-col items-center gap-8"
        >
          {/* Step progress */}
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className="h-1 w-10 rounded-full transition-all duration-300"
                style={{
                  background:
                    s <= step
                      ? "linear-gradient(90deg, rgba(124,77,255,0.9), rgba(167,139,250,0.9))"
                      : "rgba(124,77,255,0.15)",
                }}
              />
            ))}
          </div>

          <div className="text-center space-y-2">
            <h1
              className="text-3xl font-bold tracking-[0.25em]"
              style={{ fontFamily: "'Cinzel', serif" }}
            >
              {title}
            </h1>
            <p
              className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Step {step} of 4 — {subtitle}
            </p>
          </div>

          {children}

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] px-3 py-2.5 rounded-sm border max-w-sm text-center"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                color: "#f87171",
                borderColor: "rgba(248,113,113,0.35)",
                background: "rgba(248,113,113,0.06)",
              }}
            >
              {error}
            </motion.p>
          )}

          <button
            onClick={onNext}
            disabled={nextDisabled || loading}
            className="flex items-center justify-center gap-2.5 px-10 py-3.5 rounded-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "11px",
              letterSpacing: "0.22em",
              background:
                "linear-gradient(135deg, rgba(124,77,255,0.75) 0%, rgba(90,40,220,0.9) 100%)",
              border: "1px solid rgba(124,77,255,0.55)",
              color: "#f0ecff",
              boxShadow: "0 0 24px rgba(124,77,255,0.18)",
            }}
          >
            <span className="uppercase">{nextLabel}</span>
            {loading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ArrowRight size={14} />
            )}
          </button>
        </motion.div>
      </main>
    </div>
  );
}
