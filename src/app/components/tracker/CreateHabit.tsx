"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";
import { DIFFICULTIES, type Difficulty } from "@/app/lib/xp";
import { WEEKDAYS } from "@/app/lib/constants";
import type { Habit, Hero } from "@/app/lib/types";

export function CreateHabit({
  hero,
  onCreated,
}: {
  hero: Hero;
  onCreated: (h: Habit) => void;
}) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [everyday, setEveryday] = useState(true);
  const [days, setDays] = useState<Set<number>>(new Set());
  const [adding, setAdding] = useState(false);

  const xpTerm = (hero.archetype?.xp_term ?? "XP").toUpperCase();
  const taskTerm = (hero.archetype?.task_term ?? "Quest").toUpperCase();

  const toggleDay = (i: number) =>
    setDays((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const add = async () => {
    const trimmed = title.trim();
    if (!trimmed || adding) return;
    if (!everyday && days.size === 0) {
      toast.error("Pick at least one day, or choose Every day.");
      return;
    }
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
        is_paused: false,
        weekdays: everyday ? null : [...days],
      })
      .select()
      .single();
    setAdding(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    onCreated(data as Habit);
    setTitle("");
    setDifficulty("easy");
    setEveryday(true);
    setDays(new Set());
  };

  return (
    <div className="rounded-sm border border-border bg-card/40 p-4 space-y-3">
      <p className="text-[9px] tracking-[0.24em] uppercase text-accent mono">
        ◈ Forge a new {taskTerm}
      </p>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="e.g. Train for 30 minutes"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") add();
          }}
          maxLength={80}
          className="flex-1 px-3.5 py-2.5 text-sm bg-background/60 rounded-sm outline-none border border-border focus:border-primary/60 transition-colors min-w-0"
        />
        <button
          onClick={add}
          disabled={!title.trim() || adding}
          className="px-4 rounded-sm border flex items-center gap-1.5 text-[10px] tracking-[0.16em] transition-all duration-150 disabled:opacity-40 mono"
          style={{
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

      {/* Difficulty */}
      <div className="flex gap-2">
        {DIFFICULTIES.map((d) => {
          const sel = difficulty === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setDifficulty(d.id)}
              className="flex-1 py-2 rounded-sm border text-center transition-all duration-150 mono"
              style={{
                background: sel ? `${d.color}1e` : "transparent",
                borderColor: sel ? `${d.color}70` : "var(--border)",
              }}
            >
              <span
                className="block text-[9px] tracking-[0.18em]"
                style={{ color: sel ? d.color : "var(--muted-foreground)" }}
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

      {/* Schedule */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => setEveryday(true)}
          className="px-3 py-2 rounded-sm border text-[9px] tracking-[0.16em] uppercase transition-all mono"
          style={{
            background: everyday ? "rgba(124,77,255,0.16)" : "transparent",
            borderColor: everyday ? "rgba(124,77,255,0.5)" : "var(--border)",
            color: everyday ? "var(--accent)" : "var(--muted-foreground)",
          }}
        >
          Every day
        </button>
        <div className="flex gap-1">
          {WEEKDAYS.map((d) => {
            const sel = !everyday && days.has(d.i);
            return (
              <button
                key={d.i}
                onClick={() => {
                  setEveryday(false);
                  toggleDay(d.i);
                }}
                className="w-8 h-8 rounded-sm border text-[10px] transition-all mono"
                style={{
                  background: sel ? "rgba(124,77,255,0.18)" : "transparent",
                  borderColor: sel ? "rgba(124,77,255,0.6)" : "var(--border)",
                  color: sel ? "var(--accent)" : "var(--muted-foreground)",
                }}
                title={d.label}
              >
                {d.short}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
