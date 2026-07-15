"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  Archive,
  ArchiveRestore,
  Check,
  Flame,
  Loader2,
  MoreVertical,
  Pause,
  Pencil,
  Play,
  Snowflake,
  Trash2,
} from "lucide-react";
import { difficultyFromReward } from "@/app/lib/xp";
import { scheduleLabel } from "@/app/lib/schedule";
import type { Streak } from "@/app/lib/streaks";
import type { Habit } from "@/app/lib/types";

export function HabitRow({
  habit,
  done,
  busy,
  streak,
  xpTerm,
  taskTerm,
  onComplete,
  onUncomplete,
  onPause,
  onArchive,
  onDelete,
  onRename,
}: {
  habit: Habit;
  done: boolean;
  busy: boolean;
  streak: Streak;
  xpTerm: string;
  taskTerm: string;
  onComplete: () => void;
  onUncomplete: () => void;
  onPause: () => void;
  onArchive: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const meta = difficultyFromReward(habit.xp_reward);
  const [menu, setMenu] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(habit.title);
  const menuRef = useRef<HTMLDivElement>(null);
  const paused = !!habit.is_paused;

  useEffect(() => {
    if (!menu) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenu(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menu]);

  const commitRename = () => {
    const v = draft.trim();
    setEditing(false);
    if (v && v !== habit.title) onRename(v);
    else setDraft(habit.title);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="rounded-sm border p-3.5 flex items-center gap-3.5 group transition-colors relative"
      style={{
        borderColor: done ? `${meta.color}45` : "var(--border)",
        background: done ? `${meta.color}0c` : "var(--card)",
        opacity: paused ? 0.55 : 1,
      }}
    >
      {/* Complete toggle */}
      <button
        onClick={done ? onUncomplete : onComplete}
        disabled={busy || paused}
        title={done ? "Undo" : `Complete ${taskTerm.toLowerCase()}`}
        className="w-9 h-9 rounded-sm border flex items-center justify-center flex-shrink-0 transition-all duration-150 hover:scale-105 disabled:opacity-50"
        style={{
          borderColor: done ? meta.color : `${meta.color}50`,
          background: done ? `${meta.color}30` : "transparent",
          color: meta.color,
          boxShadow: done ? `0 0 14px ${meta.color}35` : "none",
        }}
      >
        {busy ? (
          <Loader2 size={14} className="animate-spin" />
        ) : done ? (
          <Check size={15} strokeWidth={3} />
        ) : null}
      </button>

      <div className="min-w-0 flex-1">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitRename();
              if (e.key === "Escape") {
                setDraft(habit.title);
                setEditing(false);
              }
            }}
            maxLength={80}
            className="w-full px-2 py-1 text-sm bg-background/70 rounded-sm outline-none border border-primary/50"
          />
        ) : (
          <p
            className={`text-sm truncate ${done ? "line-through text-muted-foreground" : "text-foreground"}`}
          >
            {habit.title}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-[8px] tracking-[0.18em] mono"
            style={{ color: meta.color }}
          >
            {meta.label} · +{habit.xp_reward} {xpTerm}
          </span>
          <span className="text-[8px] tracking-[0.14em] text-muted-foreground/70 mono uppercase">
            {scheduleLabel(habit)}
          </span>
          {paused && (
            <span className="text-[8px] tracking-[0.16em] text-muted-foreground mono uppercase">
              · paused
            </span>
          )}
        </div>
      </div>

      {/* Streak */}
      {(streak.current > 0 || streak.frozen) && (
        <div
          className="flex items-center gap-1 text-[11px] mono flex-shrink-0"
          style={{ color: streak.frozen ? "#67e8f9" : "#fb923c" }}
          title={
            streak.frozen
              ? "Streak frozen — a recent miss is within your grace period"
              : `${streak.current}-day streak (best ${streak.best})`
          }
        >
          {streak.frozen ? <Snowflake size={13} /> : <Flame size={13} />}
          {streak.current}
        </div>
      )}

      {/* Manage */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenu((v) => !v)}
          className="w-7 h-7 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
          title="Manage"
        >
          <MoreVertical size={14} />
        </button>
        {menu && (
          <div
            className="absolute right-0 top-8 z-30 w-40 rounded-sm border border-border py-1 shadow-lg"
            style={{ background: "var(--popover)" }}
          >
            <MenuItem
              icon={<Pencil size={12} />}
              label="Rename"
              onClick={() => {
                setMenu(false);
                setDraft(habit.title);
                setEditing(true);
              }}
            />
            <MenuItem
              icon={paused ? <Play size={12} /> : <Pause size={12} />}
              label={paused ? "Resume" : "Pause"}
              onClick={() => {
                setMenu(false);
                onPause();
              }}
            />
            <MenuItem
              icon={
                habit.archived_at ? (
                  <ArchiveRestore size={12} />
                ) : (
                  <Archive size={12} />
                )
              }
              label={habit.archived_at ? "Unarchive" : "Archive"}
              onClick={() => {
                setMenu(false);
                onArchive();
              }}
            />
            <MenuItem
              icon={<Trash2 size={12} />}
              label="Delete"
              danger
              onClick={() => {
                setMenu(false);
                onDelete();
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2 flex items-center gap-2 text-[11px] tracking-[0.08em] mono transition-colors hover:bg-muted/50"
      style={{ color: danger ? "#e05252" : "var(--foreground)" }}
    >
      {icon}
      {label}
    </button>
  );
}
