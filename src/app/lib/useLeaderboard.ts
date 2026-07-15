"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import type { LeaderboardPeriod } from "@/app/lib/ranks";

export interface LeaderboardRow {
  user_id: string;
  username: string | null;
  archetype_name: string | null;
  level: number;
  xp: number;
  rank: number;
}

export interface MyRanking {
  rank: number;
  xp: number;
  total_players: number;
}

/**
 * Fetches the top-N leaderboard for a period plus the caller's own ranking.
 * Both come from SECURITY DEFINER RPCs (see supabase/schema-v3.sql).
 */
export function useLeaderboard(period: LeaderboardPeriod, limit: number) {
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [me, setMe] = useState<MyRanking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const supabase = createClient();
    Promise.all([
      supabase.rpc("leaderboard", { p_period: period, p_limit: limit }),
      supabase.rpc("my_ranking", { p_period: period }),
    ]).then(([board, mine]) => {
      if (cancelled) return;
      if (board.error) setError(board.error.message);
      setRows((board.data as LeaderboardRow[]) ?? []);
      setMe(((mine.data as MyRanking[]) ?? [])[0] ?? null);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [period, limit]);

  return { rows, me, loading, error };
}
