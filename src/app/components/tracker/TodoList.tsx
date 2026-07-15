"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, Loader2, Plus, Trash2 } from "lucide-react";
import { DIFFICULTIES, type Difficulty } from "@/app/lib/xp";
import type { Todo } from "@/app/lib/types";

export function TodoList({
  todos,
  busyId,
  xpTerm,
  onAdd,
  onToggle,
  onDelete,
}: {
  todos: Todo[];
  busyId: string | null;
  xpTerm: string;
  onAdd: (title: string, xp: number) => void;
  onToggle: (t: Todo) => void;
  onDelete: (t: Todo) => void;
}) {
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const add = () => {
    const v = title.trim();
    if (!v) return;
    const meta = DIFFICULTIES.find((d) => d.id === difficulty)!;
    onAdd(v, meta.xp);
    setTitle("");
  };

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="space-y-4">
      <div className="rounded-sm border border-border bg-card/40 p-4 space-y-3">
        <p className="text-[9px] tracking-[0.24em] uppercase text-accent mono">
          ◈ One-off task
        </p>
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            placeholder="e.g. Book dentist appointment"
            maxLength={80}
            className="flex-1 px-3.5 py-2.5 text-sm bg-background/60 rounded-sm outline-none border border-border focus:border-primary/60 transition-colors min-w-0"
          />
          <button
            onClick={add}
            disabled={!title.trim()}
            className="px-4 rounded-sm border flex items-center gap-1.5 text-[10px] tracking-[0.16em] transition-all disabled:opacity-40 mono"
            style={{
              background: "rgba(124,77,255,0.16)",
              borderColor: "rgba(124,77,255,0.45)",
              color: "var(--accent)",
            }}
          >
            <Plus size={12} />
            ADD
          </button>
        </div>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => {
            const sel = difficulty === d.id;
            return (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className="flex-1 py-1.5 rounded-sm border text-center transition-all mono text-[9px] tracking-[0.14em]"
                style={{
                  background: sel ? `${d.color}1e` : "transparent",
                  borderColor: sel ? `${d.color}70` : "var(--border)",
                  color: sel ? d.color : "var(--muted-foreground)",
                }}
              >
                +{d.xp} {xpTerm}
              </button>
            );
          })}
        </div>
      </div>

      {todos.length === 0 ? (
        <p className="text-center text-[11px] tracking-[0.18em] text-muted-foreground py-8 mono">
          NO TASKS — YOUR LIST IS CLEAR
        </p>
      ) : (
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {[...open, ...done].map((t) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -16 }}
                className="rounded-sm border p-3 flex items-center gap-3 group"
                style={{
                  borderColor: t.done ? "rgba(74,222,128,0.35)" : "var(--border)",
                  background: t.done ? "rgba(74,222,128,0.06)" : "var(--card)",
                }}
              >
                <button
                  onClick={() => onToggle(t)}
                  disabled={busyId === t.id}
                  className="w-7 h-7 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 disabled:opacity-50"
                  style={{
                    borderColor: t.done ? "#4ade80" : "var(--border)",
                    background: t.done ? "rgba(74,222,128,0.25)" : "transparent",
                    color: "#4ade80",
                  }}
                >
                  {busyId === t.id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : t.done ? (
                    <Check size={13} strokeWidth={3} />
                  ) : null}
                </button>
                <p
                  className={`flex-1 min-w-0 text-sm truncate ${t.done ? "line-through text-muted-foreground" : ""}`}
                >
                  {t.title}
                </p>
                <span className="text-[8px] tracking-[0.14em] text-muted-foreground mono flex-shrink-0">
                  +{t.xp_reward} {xpTerm}
                </span>
                <button
                  onClick={() => onDelete(t)}
                  className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded-sm flex items-center justify-center text-muted-foreground hover:text-red-400 transition-all flex-shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
