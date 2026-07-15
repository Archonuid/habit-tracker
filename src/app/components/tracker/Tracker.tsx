"use client";

import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  ListChecks,
  Loader2,
  Sun,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { archetypeStyle } from "@/app/lib/constants";
import { todayKey } from "@/app/lib/dates";
import {
  dailyStreak,
  habitStreak,
  perfectDayStreak,
  type Streak,
} from "@/app/lib/streaks";
import type { Habit, HabitCompletion, Hero, Todo } from "@/app/lib/types";
import { CreateHabit } from "./CreateHabit";
import { TodayView, type HabitActions } from "./TodayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { TodoList } from "./TodoList";
import { StatsView } from "./StatsView";

type View = "today" | "week" | "month" | "todos" | "stats";

const VIEWS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "today", label: "TODAY", icon: <Sun size={13} /> },
  { id: "week", label: "WEEK", icon: <CalendarDays size={13} /> },
  { id: "month", label: "MONTH", icon: <CalendarRange size={13} /> },
  { id: "todos", label: "TO-DO", icon: <ListChecks size={13} /> },
  { id: "stats", label: "STATS", icon: <BarChart3 size={13} /> },
];

export function Tracker({
  hero,
  onStatsChange,
}: {
  hero: Hero;
  onStatsChange: (xp: number, level: number) => void;
}) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("today");
  const [busyHabit, setBusyHabit] = useState<string | null>(null);
  const [busyTodo, setBusyTodo] = useState<string | null>(null);

  const style = archetypeStyle(hero.archetype?.name);
  const xpTerm = (hero.archetype?.xp_term ?? "XP").toUpperCase();
  const taskTerm = (hero.archetype?.task_term ?? "Quest").toUpperCase();
  const levelTerm = (hero.archetype?.level_term ?? "Level").toUpperCase();
  const tk = todayKey();

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const [habitsRes, compsRes, todosRes] = await Promise.all([
        supabase.from("habits").select("*").order("created_at", { ascending: true }),
        supabase
          .from("habit_completions")
          .select("habit_id, completed_on, xp_granted"),
        supabase.from("todos").select("*").order("created_at", { ascending: true }),
      ]);
      setHabits((habitsRes.data as Habit[]) ?? []);
      setCompletions((compsRes.data as HabitCompletion[]) ?? []);
      setTodos((todosRes.data as Todo[]) ?? []);
      setLoading(false);
    })();
  }, []);

  // ── derived data ──
  const nonArchived = useMemo(
    () => habits.filter((h) => !h.archived_at),
    [habits]
  );

  const { compByHabit, compByDay, daysWithAny, xpByDay, doneToday } = useMemo(() => {
    const byHabit = new Map<string, Set<string>>();
    const byDay = new Map<string, Set<string>>();
    const anyDays = new Set<string>();
    const xpDay = new Map<string, number>();
    const today = new Set<string>();
    for (const c of completions) {
      const k = c.completed_on.slice(0, 10);
      if (!byHabit.has(c.habit_id)) byHabit.set(c.habit_id, new Set());
      byHabit.get(c.habit_id)!.add(k);
      if (!byDay.has(k)) byDay.set(k, new Set());
      byDay.get(k)!.add(c.habit_id);
      anyDays.add(k);
      xpDay.set(k, (xpDay.get(k) ?? 0) + (c.xp_granted ?? 0));
      if (k === tk) today.add(c.habit_id);
    }
    return {
      compByHabit: byHabit,
      compByDay: byDay,
      daysWithAny: anyDays,
      xpByDay: xpDay,
      doneToday: today,
    };
  }, [completions, tk]);

  const streaks = useMemo(() => {
    const m = new Map<string, Streak>();
    for (const h of habits) {
      m.set(h.id, habitStreak(h, compByHabit.get(h.id) ?? new Set()));
    }
    return m;
  }, [habits, compByHabit]);

  const dailyStreakVal = useMemo(() => dailyStreak(daysWithAny), [daysWithAny]);
  const perfectStreakVal = useMemo(
    () => perfectDayStreak(nonArchived, compByDay),
    [nonArchived, compByDay]
  );

  // ── XP feedback helper ──
  const celebrate = (
    awarded: number,
    leveledUp: boolean,
    newLevel: number,
    title: string
  ) => {
    if (awarded <= 0) return;
    if (leveledUp) {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#7c4dff", "#a78bfa", "#f0ecff"],
      });
      toast.success(`${levelTerm} UP! You reached ${levelTerm} ${newLevel}`, {
        description: `+${awarded} ${xpTerm} — ${title}`,
      });
    } else {
      toast.success(`+${awarded} ${xpTerm}`, { description: title });
    }
  };

  // ── habit actions ──
  const completeHabit = async (habit: Habit) => {
    if (busyHabit || doneToday.has(habit.id)) return;
    setBusyHabit(habit.id);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("complete_habit", {
      p_habit_id: habit.id,
    });
    setBusyHabit(null);
    if (error) return toast.error(error.message);
    const r = Array.isArray(data) ? data[0] : data;
    if (!r) return;
    if (r.awarded > 0) {
      setCompletions((prev) => [
        ...prev,
        { habit_id: habit.id, completed_on: tk, xp_granted: r.awarded },
      ]);
    }
    onStatsChange(r.new_xp, r.new_level);
    celebrate(r.awarded, r.leveled_up, r.new_level, habit.title);
  };

  const uncompleteHabit = async (habit: Habit) => {
    if (busyHabit || !doneToday.has(habit.id)) return;
    setBusyHabit(habit.id);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("uncomplete_habit", {
      p_habit_id: habit.id,
    });
    setBusyHabit(null);
    if (error) return toast.error(error.message);
    const r = Array.isArray(data) ? data[0] : data;
    setCompletions((prev) =>
      prev.filter((c) => !(c.habit_id === habit.id && c.completed_on.slice(0, 10) === tk))
    );
    if (r) onStatsChange(r.new_xp, r.new_level);
  };

  const patchHabit = (id: string, patch: Partial<Habit>) =>
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));

  const togglePause = async (habit: Habit) => {
    const next = !habit.is_paused;
    patchHabit(habit.id, { is_paused: next });
    const supabase = createClient();
    const { error } = await supabase
      .from("habits")
      .update({ is_paused: next })
      .eq("id", habit.id);
    if (error) {
      patchHabit(habit.id, { is_paused: !next });
      toast.error(error.message);
    } else {
      toast.success(next ? "Paused." : "Resumed.");
    }
  };

  const toggleArchive = async (habit: Habit) => {
    const next = habit.archived_at ? null : new Date().toISOString();
    patchHabit(habit.id, { archived_at: next });
    const supabase = createClient();
    const { error } = await supabase
      .from("habits")
      .update({ archived_at: next })
      .eq("id", habit.id);
    if (error) {
      patchHabit(habit.id, { archived_at: habit.archived_at });
      toast.error(error.message);
    } else {
      toast.success(next ? "Archived." : "Unarchived.");
    }
  };

  const renameHabit = async (habit: Habit, title: string) => {
    patchHabit(habit.id, { title });
    const supabase = createClient();
    const { error } = await supabase
      .from("habits")
      .update({ title })
      .eq("id", habit.id);
    if (error) {
      patchHabit(habit.id, { title: habit.title });
      toast.error(error.message);
    }
  };

  const deleteHabit = async (habit: Habit) => {
    setHabits((prev) => prev.filter((h) => h.id !== habit.id));
    setCompletions((prev) => prev.filter((c) => c.habit_id !== habit.id));
    const supabase = createClient();
    const { error } = await supabase.from("habits").delete().eq("id", habit.id);
    if (error) toast.error(error.message);
  };

  const habitActions: HabitActions = {
    onComplete: completeHabit,
    onUncomplete: uncompleteHabit,
    onPause: togglePause,
    onArchive: toggleArchive,
    onDelete: deleteHabit,
    onRename: renameHabit,
  };

  // ── todo actions ──
  const addTodo = async (title: string, xp: number) => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("todos")
      .insert({ user_id: hero.profile.id, title, xp_reward: xp, done: false })
      .select()
      .single();
    if (error) return toast.error(error.message);
    setTodos((prev) => [...prev, data as Todo]);
  };

  const toggleTodo = async (t: Todo) => {
    if (busyTodo) return;
    setBusyTodo(t.id);
    const supabase = createClient();
    if (!t.done) {
      const { data, error } = await supabase.rpc("complete_todo", {
        p_todo_id: t.id,
      });
      setBusyTodo(null);
      if (error) return toast.error(error.message);
      const r = Array.isArray(data) ? data[0] : data;
      setTodos((prev) =>
        prev.map((x) => (x.id === t.id ? { ...x, done: true } : x))
      );
      if (r) {
        onStatsChange(r.new_xp, r.new_level);
        celebrate(r.awarded, r.leveled_up, r.new_level, t.title);
      }
    } else {
      const { data, error } = await supabase.rpc("uncomplete_todo", {
        p_todo_id: t.id,
      });
      setBusyTodo(null);
      if (error) return toast.error(error.message);
      const r = Array.isArray(data) ? data[0] : data;
      setTodos((prev) =>
        prev.map((x) => (x.id === t.id ? { ...x, done: false } : x))
      );
      if (r) onStatsChange(r.new_xp, r.new_level);
    }
  };

  const deleteTodo = async (t: Todo) => {
    setTodos((prev) => prev.filter((x) => x.id !== t.id));
    const supabase = createClient();
    const { error } = await supabase.from("todos").delete().eq("id", t.id);
    if (error) toast.error(error.message);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin text-muted-foreground" size={22} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl space-y-5">
      {/* View switcher */}
      <div className="flex gap-1.5 rounded-sm border border-border bg-card/40 p-1">
        {VIEWS.map((v) => {
          const active = view === v.id;
          return (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className="flex-1 py-2 rounded-sm flex items-center justify-center gap-1.5 text-[9px] tracking-[0.14em] transition-all mono"
              style={{
                background: active ? "rgba(124,77,255,0.16)" : "transparent",
                color: active ? "var(--accent)" : "var(--muted-foreground)",
              }}
            >
              {v.icon}
              <span className="hidden sm:inline">{v.label}</span>
            </button>
          );
        })}
      </div>

      {view !== "todos" && view !== "stats" && view !== "month" && (
        <CreateHabit hero={hero} onCreated={(h) => setHabits((p) => [...p, h])} />
      )}

      {view === "today" && (
        <TodayView
          habits={nonArchived}
          doneToday={doneToday}
          streaks={streaks}
          busyId={busyHabit}
          xpTerm={xpTerm}
          taskTerm={taskTerm}
          actions={habitActions}
        />
      )}

      {view === "week" && (
        <WeekView
          habits={nonArchived}
          compByHabit={compByHabit}
          taskTerm={taskTerm}
        />
      )}

      {view === "month" && (
        <MonthView
          habits={nonArchived}
          compByDay={compByDay}
          xpByDay={xpByDay}
          color={style.color}
          xpTerm={xpTerm}
        />
      )}

      {view === "todos" && (
        <TodoList
          todos={todos}
          busyId={busyTodo}
          xpTerm={xpTerm}
          onAdd={addTodo}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
        />
      )}

      {view === "stats" && (
        <StatsView
          hero={hero}
          completions={completions}
          daily={dailyStreakVal}
          perfect={perfectStreakVal}
          color={style.color}
        />
      )}
    </div>
  );
}
