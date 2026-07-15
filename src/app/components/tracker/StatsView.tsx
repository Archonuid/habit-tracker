"use client";

import { useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";
import { Flame, Snowflake, Sparkles, Star, Trophy } from "lucide-react";
import { dateKey, lastNDays } from "@/app/lib/dates";
import type { Streak } from "@/app/lib/streaks";
import type { HabitCompletion, Hero } from "@/app/lib/types";

export function StatsView({
  hero,
  completions,
  daily,
  perfect,
  color,
}: {
  hero: Hero;
  completions: HabitCompletion[];
  daily: Streak;
  perfect: Streak;
  color: string;
}) {
  const xpTerm = (hero.archetype?.xp_term ?? "XP").toUpperCase();
  const taskTerm = (hero.archetype?.task_term ?? "Quest").toUpperCase();

  const xpByDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of completions) {
      const k = c.completed_on.slice(0, 10);
      m.set(k, (m.get(k) ?? 0) + (c.xp_granted ?? 0));
    }
    return m;
  }, [completions]);

  const barData = useMemo(
    () =>
      lastNDays(14).map((d) => ({
        label: d.toLocaleDateString(undefined, { weekday: "narrow" }),
        date: d.getDate(),
        xp: xpByDay.get(dateKey(d)) ?? 0,
      })),
    [xpByDay]
  );

  const areaData = useMemo(() => {
    let cum = 0;
    return lastNDays(30).map((d) => {
      cum += xpByDay.get(dateKey(d)) ?? 0;
      return {
        label: `${d.getMonth() + 1}/${d.getDate()}`,
        xp: cum,
      };
    });
  }, [xpByDay]);

  const totalQuests = completions.length;

  return (
    <div className="space-y-4">
      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <Tile icon={<Trophy size={14} />} label={`Total ${xpTerm}`} value={hero.profile.current_xp} color={color} />
        <Tile icon={<Star size={14} />} label={`${taskTerm}s done`} value={totalQuests} color={color} />
        <Tile icon={<Flame size={14} />} label="Daily streak" value={`${daily.current}d`} color="#fb923c" />
        <Tile icon={<Trophy size={14} />} label="Best streak" value={`${daily.best}d`} color={color} />
        <Tile icon={<Sparkles size={14} />} label="Perfect days" value={`${perfect.current}d`} color="#fbbf24" />
        <Tile
          icon={perfect.frozen ? <Snowflake size={14} /> : <Sparkles size={14} />}
          label="Status"
          value={daily.frozen ? "Frozen" : daily.current > 0 ? "On fire" : "Idle"}
          color={daily.frozen ? "#67e8f9" : "#4ade80"}
        />
      </div>

      {/* XP per day */}
      <ChartCard title={`${xpTerm} earned — last 14 days`}>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={barData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<TipContent unit={xpTerm} />} cursor={{ fill: `${color}14` }} />
            <Bar dataKey="xp" fill={color} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Cumulative XP */}
      <ChartCard title={`${xpTerm} earned — cumulative, 30 days`}>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={areaData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id="xpFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 8, fill: "var(--muted-foreground)" }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <Tooltip content={<TipContent unit={xpTerm} />} cursor={{ stroke: color }} />
            <Area type="monotone" dataKey="xp" stroke={color} strokeWidth={2} fill="url(#xpFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

function Tile({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className="rounded-sm border p-3 text-center space-y-1"
      style={{ borderColor: "var(--border)", background: `${color}08` }}
    >
      <div className="flex justify-center" style={{ color }}>
        {icon}
      </div>
      <div className="text-lg font-bold serif">{value}</div>
      <div className="text-[8px] tracking-[0.12em] uppercase text-muted-foreground mono truncate">
        {label}
      </div>
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-border bg-card/40 p-4 space-y-2">
      <p className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground mono">
        {title}
      </p>
      {children}
    </div>
  );
}

function TipContent({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-sm border px-2.5 py-1.5 text-[10px] mono"
      style={{ background: "var(--popover)", borderColor: "var(--border)" }}
    >
      <div className="text-muted-foreground">{label}</div>
      <div className="font-bold">
        {payload[0].value} {unit}
      </div>
    </div>
  );
}
