"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import {
  DIFFICULTIES,
  difficultyFromReward,
  type Difficulty,
} from "@/app/lib/xp";
import type { Habit, Hero } from "@/app/lib/types";

export function Tracker({
  hero,
  onStatsChange,
}: {
  hero: Hero;
  onStatsChange: (xp: number, level: number) => void;
}) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [doneToday, setDoneToday] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [adding, setAdding] = useState(false);
  const [completing, setCompleting] = useState<string | null>(null);

  const taskTerm = (hero.archetype?.task_term ?? "Quest").toUpperCase();
  const xpTerm = (hero.archetype?.xp_term ?? "XP").toUpperCase();
  const levelTerm = (hero.archetype?.level_term ?? "Level").toUpperCase();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [habitsRes, doneRes] = await Promise.all([
        supabase
          .from("habits")
          .select("*")
          .order("created_at", { ascending: true }),
        supabase
          .from("habit_completions")
          .select("habit_id")
          .eq("completed_on", today),
      ]);
      setHabits(
        ((habitsRes.data as Habit[]) ?? []).filter((h) => h.is_active !== false)
      );
      setDoneToday(
        new Set((doneRes.data ?? []).map((c) => c.habit_id as string))
      );
      setLoading(false);
    })();
  }, []);

  const addHabit = async () => {
    const trimmed = title.trim();
    if (!trimmed || adding) return;
    setAdding(true);
    const supabase = createClient();
    const meta = DIFFICULTIES.find((d) => d.id === difficulty)!;
    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: hero.profile.id,
        title: trimmed,
        xp_reward: meta.xp,
        is_active: true,
      })
      .select()
      .single();
    setAdding(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setHabits((h) => [...h, data as Habit]);
    setTitle("");
  };

  const deleteHabit = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("habits").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setHabits((h) => h.filter((x) => x.id !== id));
  };

  const completeHabit = async (habit: Habit) => {
    if (doneToday.has(habit.id) || completing) return;
    setCompleting(habit.id);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("complete_habit", {
      p_habit_id: habit.id,
    });
    setCompleting(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    const result = Array.isArray(data) ? data[0] : data;
    if (!result) return;

    setDoneToday((s) => new Set(s).add(habit.id));
    onStatsChange(result.new_xp, result.new_level);

    if (result.awarded > 0) {
      if (result.leveled_up) {
        confetti({
          particleCount: 140,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#7c4dff", "#a78bfa", "#f0ecff"],
        });
        toast.success(`${levelTerm} UP! You reached ${levelTerm} ${result.new_level}`, {
          description: `+${result.awarded} ${xpTerm} — ${habit.title}`,
        });
      } else {
        toast.success(`+${result.awarded} ${xpTerm}`, {
          description: habit.title,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-muted-foreground" size={22} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl space-y-6">
      {/* ── New habit form ── */}
      <div className="rounded-sm border border-border bg-card/40 p-4 space-y-3">
        <p
          className="text-[9px] tracking-[0.24em] uppercase text-accent"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          ◈ Forge a new {taskTerm}
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Train for 30 minutes"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addHabit();
            }}
            maxLength={80}
            className="flex-1 px-3.5 py-2.5 text-sm bg-background/60 rounded-sm outline-none border border-border focus:border-primary/60 transition-colors min-w-0"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          />
          <button
            onClick={addHabit}
            disabled={!title.trim() || adding}
            className="px-4 rounded-sm border flex items-center gap-1.5 text-[10px] tracking-[0.16em] transition-all duration-150 disabled:opacity-40"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              background: "rgba(124,77,255,0.16)",
              borderColor: "rgba(124,77,255,0.45)",
              color: "var(--accent)",
            }}
          >
            {adding ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Plus size={12} />
            )}
            ADD
          </button>
        </div>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => {
            const isSelected = difficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className="flex-1 py-2 rounded-sm border text-center transition-all duration-150"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  background: isSelected ? `${d.color}1e` : "transparent",
                  borderColor: isSelected ? `${d.color}70` : "var(--border)",
                }}
              >
                <span
                  className="block text-[9px] tracking-[0.18em]"
                  style={{
                    color: isSelected ? d.color : "var(--muted-foreground)",
                  }}
                >
                  {d.label}
                </span>
                <span className="block text-[8px] tracking-[0.12em] text-muted-foreground/70">
                  +{d.xp} {xpTerm}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Quest list ── */}
      {habits.length === 0 ? (
        <p
          className="text-center text-[11px] tracking-[0.18em] text-muted-foreground py-10"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          NO {taskTerm}S YET — FORGE YOUR FIRST ONE ABOVE
        </p>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence initial={false}>
            {habits.map((habit) => {
              const done = doneToday.has(habit.id);
              const meta = difficultyFromReward(habit.xp_reward);
              return (
                <motion.div
                  key={habit.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="rounded-sm border p-3.5 flex items-center gap-3.5 group transition-colors"
                  style={{
                    borderColor: done ? `${meta.color}45` : "var(--border)",
                    background: done ? `${meta.color}0c` : "var(--card)",
                  }}
                >
                  {/* Complete button */}
                  <button
                    onClick={() => completeHabit(habit)}
                    disabled={done || completing === habit.id}
                    title={done ? "Completed today" : `Complete ${taskTerm.toLowerCase()}`}
                    className="w-9 h-9 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all duration-150 disabled:cursor-default hover:scale-105"
                    style={{
                      borderColor: done ? meta.color : `${meta.color}50`,
                      background: done ? `${meta.color}30` : "transparent",
                      color: meta.color,
                      boxShadow: done ? `0 0 14px ${meta.color}35` : "none",
                    }}
                  >
                    {completing === habit.id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : done ? (
                      <Check size={15} strokeWidth={3} />
                    ) : null}
                  </button>

                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm truncate ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
                    >
                      {habit.title}
                    </p>
                    <p
                      className="text-[8px] tracking-[0.18em]"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        color: meta.color,
                      }}
                    >
                      {meta.label} · +{habit.xp_reward} {xpTerm}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteHabit(habit.id)}
                    title={`Abandon ${taskTerm.toLowerCase()}`}
                    className="opacity-0 group-hover:opacity-100 w-7 h-7 rounded-sm flex items-center justify-center text-muted-foreground hover:text-red-400 transition-all flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
