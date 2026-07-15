"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, ChevronDown, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useHero } from "@/app/lib/useHero";
import { useJournal } from "@/app/lib/useJournal";
import { voiceFor } from "@/app/lib/lore";
import { levelProgress } from "@/app/lib/xp";
import { archetypeStyle, sigilKey } from "@/app/lib/constants";
import { Sigil } from "@/app/components/sigil/Sigil";
import type { JournalEntry } from "@/app/lib/types";

export default function JournalPage() {
  const { hero, loading } = useHero();
  const { entries, loading: entriesLoading, submitting, submit } = useJournal();
  const [draft, setDraft] = useState("");

  if (loading || !hero) {
    return (
      <div className="flex-1 flex items-center justify-center py-10">
        <Loader2 className="animate-spin text-muted-foreground" size={22} />
      </div>
    );
  }

  const style = archetypeStyle(hero.archetype?.name);
  const voice = voiceFor(hero.archetype?.name);
  const level = levelProgress(hero.profile.current_xp).level;

  const record = async () => {
    const body = draft.trim();
    if (body.length < 3) {
      toast.error("Write a little more first.");
      return;
    }
    try {
      await submit(body);
      setDraft("");
      toast.success("Chronicled.", {
        description: "Your entry has been rewritten as lore.",
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  return (
    <div className="flex-1 w-full flex justify-center px-4 sm:px-6 py-10">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Sigil
            archetype={sigilKey(hero.archetype?.name)}
            streak={0}
            level={level}
            size={40}
          />
          <div>
            <h1
              className="text-2xl font-bold tracking-[0.2em] serif"
              style={{ color: style.color }}
            >
              JOURNAL
            </h1>
            <p
              className="text-[10px] tracking-[0.18em] uppercase text-muted-foreground"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              Dreams, deeds &amp; days — retold as {voice.chronicle}
            </p>
          </div>
        </div>

        {/* Composer */}
        <div className="rounded-sm border border-border bg-card/40 p-4 space-y-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Record a dream, a battle, a quiet day…"
            maxLength={4000}
            rows={5}
            className="w-full px-3.5 py-3 text-sm bg-background/60 rounded-sm outline-none border border-border focus:border-primary/60 transition-colors resize-y leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <span
              className="text-[9px] tracking-[0.16em] uppercase text-muted-foreground/60"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {draft.length}/4000 · only saved when you write
            </span>
            <button
              onClick={record}
              disabled={submitting || draft.trim().length < 3}
              className="flex items-center gap-1.5 px-4 py-2 rounded-sm border text-[10px] tracking-[0.16em] uppercase transition-all disabled:opacity-40"
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                background: "rgba(124,77,255,0.16)",
                borderColor: "rgba(124,77,255,0.45)",
                color: "var(--accent)",
              }}
            >
              {submitting ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <Sparkles size={12} />
              )}
              Chronicle
            </button>
          </div>
        </div>

        {/* Chronicle timeline */}
        <div className="space-y-3">
          <p
            className="text-[9px] tracking-[0.24em] uppercase text-accent flex items-center gap-1.5"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <BookOpen size={11} /> {voice.chronicle}
          </p>

          {entriesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-muted-foreground" size={18} />
            </div>
          ) : entries.length === 0 ? (
            <p className="text-center py-10 text-[12px] text-muted-foreground leading-relaxed">
              Your chronicle is empty. Record your first entry above and watch it
              become legend.
            </p>
          ) : (
            <div className="space-y-3">
              {entries.map((e) => (
                <EntryCard key={e.id} entry={e} color={style.color} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function EntryCard({ entry, color }: { entry: JournalEntry; color: string }) {
  const [open, setOpen] = useState(false);
  const date = new Date(entry.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-sm border border-border bg-card/40 p-4 space-y-2.5"
      style={{ borderLeft: `2px solid ${color}66` }}
    >
      <p
        className="text-[9px] tracking-[0.18em] uppercase text-muted-foreground"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {date}
      </p>
      <p className="text-sm leading-relaxed whitespace-pre-line serif">
        {entry.lore ?? entry.body}
      </p>

      {/* Original entry — collapsed by default */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-[9px] tracking-[0.16em] uppercase text-muted-foreground/70 hover:text-muted-foreground transition-colors"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        <ChevronDown
          size={11}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
        {open ? "Hide" : "Show"} original
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-[12px] text-muted-foreground leading-relaxed whitespace-pre-line overflow-hidden pl-3 border-l border-border/60"
          >
            {entry.body}
          </motion.p>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
