"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase/client";
import type { JournalEntry } from "@/app/lib/types";

interface SubmitResult {
  entry: JournalEntry;
  intro: string;
}

/**
 * Loads the hero's own journal entries (newest first) and submits new ones
 * through /api/journal/generate, which writes the entry + refreshes the lore
 * intro server-side. `submit` returns the fresh intro so the caller can update
 * the profile view.
 */
export function useJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("journal_entries")
      .select("id, user_id, body, lore, created_at")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        if (cancelled) return;
        setEntries((data as JournalEntry[]) ?? []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async (body: string): Promise<SubmitResult> => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/journal/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Something went wrong.");
      setEntries((prev) => [data.entry as JournalEntry, ...prev]);
      return data as SubmitResult;
    } finally {
      setSubmitting(false);
    }
  };

  return { entries, loading, submitting, submit };
}
