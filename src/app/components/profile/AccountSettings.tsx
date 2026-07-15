"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  Check,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/app/lib/supabase/client";
import {
  PERSONALITIES,
  archetypeStyle,
  sigilKey,
  sigilTerm,
} from "@/app/lib/constants";
import { levelProgress } from "@/app/lib/xp";
import { Sigil } from "@/app/components/sigil/Sigil";
import type { ArchetypeRow, Hero } from "@/app/lib/types";

const USERNAME_RE = /^[a-zA-Z0-9_]{3,20}$/;

export function AccountSettings({
  hero,
  patchProfile,
  setArchetype,
  patchFamiliar,
}: {
  hero: Hero;
  patchProfile: (p: Partial<Hero["profile"]>) => void;
  setArchetype: (a: ArchetypeRow | null) => void;
  patchFamiliar: (f: Partial<NonNullable<Hero["familiar"]>>) => void;
}) {
  const router = useRouter();
  const style = archetypeStyle(hero.archetype?.name);
  const term = sigilTerm(hero.archetype?.name);

  // ── username ──
  const [username, setUsername] = useState(hero.profile.username ?? "");
  const [savingName, setSavingName] = useState(false);

  const saveUsername = async () => {
    const v = username.trim();
    if (!USERNAME_RE.test(v)) {
      toast.error("3–20 letters, numbers or underscores.");
      return;
    }
    if (v === hero.profile.username) return;
    setSavingName(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ username: v })
      .eq("id", hero.profile.id);
    setSavingName(false);
    if (error) {
      toast.error(
        error.code === "23505" ? "That name is already taken." : error.message
      );
      return;
    }
    patchProfile({ username: v });
    toast.success("Name updated.");
  };

  // ── sigil (companion) ──
  const [famName, setFamName] = useState(hero.familiar?.name ?? "");
  const [famPersonality, setFamPersonality] = useState(
    hero.familiar?.personality ?? "genki"
  );
  const [savingFam, setSavingFam] = useState(false);

  const saveFamiliar = async () => {
    const v = famName.trim();
    if (v.length < 2) {
      toast.error(`Your ${term.toLowerCase()} needs a name.`);
      return;
    }
    setSavingFam(true);
    const supabase = createClient();
    const { error } = await supabase.from("familiars").upsert(
      {
        user_id: hero.profile.id,
        name: v,
        personality: famPersonality,
      },
      { onConflict: "user_id" }
    );
    setSavingFam(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    patchFamiliar({ name: v, personality: famPersonality });
    toast.success(`${term} updated.`);
  };

  // ── archetype ──
  const [archetypes, setArchetypes] = useState<ArchetypeRow[]>([]);
  const [savingArch, setSavingArch] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("archetypes")
      .select("*")
      .order("name")
      .then(({ data }) => setArchetypes((data as ArchetypeRow[]) ?? []));
  }, []);

  const chooseArchetype = async (a: ArchetypeRow) => {
    if (a.id === hero.archetype?.id || savingArch) return;
    setSavingArch(a.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ archetype_id: a.id })
      .eq("id", hero.profile.id);
    setSavingArch(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    patchProfile({ archetype_id: a.id });
    setArchetype(a);
    toast.success(`Reborn as ${a.name}.`);
  };

  // ── lore visibility (privacy) ──
  const [lorePublic, setLorePublic] = useState(
    hero.profile.lore_public ?? false
  );
  const [savingLore, setSavingLore] = useState(false);

  const toggleLore = async () => {
    const next = !lorePublic;
    setLorePublic(next); // optimistic
    setSavingLore(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({ lore_public: next })
      .eq("id", hero.profile.id);
    setSavingLore(false);
    if (error) {
      setLorePublic(!next);
      toast.error(error.message);
      return;
    }
    patchProfile({ lore_public: next });
    toast.success(next ? "Your legend is now public." : "Your legend is now private.");
  };

  // ── delete account ──
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = async () => {
    setDeleting(true);
    const supabase = createClient();
    const { error } = await supabase.rpc("delete_own_account");
    if (error) {
      setDeleting(false);
      toast.error(error.message);
      return;
    }
    await supabase.auth.signOut();
    router.replace("/");
    router.refresh();
  };

  const nameDirty = username.trim() !== (hero.profile.username ?? "");
  const famDirty =
    famName.trim() !== (hero.familiar?.name ?? "") ||
    famPersonality !== (hero.familiar?.personality ?? "genki");

  return (
    <div className="w-full max-w-xl space-y-4">
      {/* Identity */}
      <Section title="◈ Identity">
        <label className="block text-[10px] tracking-[0.22em] uppercase text-accent mb-1.5 mono">
          Username
        </label>
        <div className="flex gap-2">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            maxLength={20}
            className="flex-1 px-3.5 py-2.5 text-sm bg-background/60 rounded-sm outline-none border border-border focus:border-primary/60 transition-colors min-w-0"
          />
          <SaveBtn onClick={saveUsername} disabled={!nameDirty} loading={savingName} />
        </div>
      </Section>

      {/* Sigil companion */}
      <Section title={`◈ ${term}`}>
        <div className="space-y-3">
          {/* Sigil preview — bound to the current archetype */}
          <div className="flex items-center gap-3.5">
            <div className="flex-shrink-0">
              <Sigil
                archetype={sigilKey(hero.archetype?.name)}
                streak={6}
                level={levelProgress(hero.profile.current_xp).level}
                size={56}
              />
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Your {term.toLowerCase()} is bound to your archetype. It brightens
              with your streak and gains a second orbit at higher{" "}
              {(hero.archetype?.level_term ?? "level").toLowerCase()}s.
            </p>
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.22em] uppercase text-accent mb-1.5 mono">
              {term}&apos;s Name
            </label>
            <input
              value={famName}
              onChange={(e) => setFamName(e.target.value)}
              maxLength={24}
              className="w-full px-3.5 py-2.5 text-sm bg-background/60 rounded-sm outline-none border border-border focus:border-primary/60 transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] tracking-[0.22em] uppercase text-accent mb-1.5 mono">
              Personality
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PERSONALITIES.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setFamPersonality(p.id)}
                  className="py-2 rounded-sm border text-center transition-all mono text-[9px] tracking-[0.14em]"
                  style={{
                    color:
                      famPersonality === p.id
                        ? p.color
                        : "var(--muted-foreground)",
                    background:
                      famPersonality === p.id ? `${p.color}18` : "transparent",
                    borderColor:
                      famPersonality === p.id ? p.color : "var(--border)",
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <SaveBtn
            onClick={saveFamiliar}
            disabled={!famDirty}
            loading={savingFam}
            full
          />
        </div>
      </Section>

      {/* Archetype */}
      <Section title="◈ Archetype">
        <p className="text-[10px] tracking-[0.12em] uppercase text-muted-foreground mb-3 mono">
          Changing your class reskins the whole realm. Your level and{" "}
          {(hero.archetype?.xp_term ?? "XP").toLowerCase()} carry over.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {archetypes.map((a) => {
            const s = archetypeStyle(a.name);
            const active = a.id === hero.archetype?.id;
            return (
              <button
                key={a.id}
                onClick={() => chooseArchetype(a)}
                disabled={!!savingArch}
                className="py-2.5 rounded-sm border text-center transition-all mono text-[10px] tracking-[0.14em] uppercase flex items-center justify-center gap-1.5 disabled:opacity-60"
                style={{
                  color: active ? s.color : "var(--muted-foreground)",
                  background: active ? `${s.color}18` : "transparent",
                  borderColor: active ? s.color : "var(--border)",
                }}
              >
                {savingArch === a.id ? (
                  <Loader2 size={11} className="animate-spin" />
                ) : active ? (
                  <Check size={11} />
                ) : null}
                {a.name}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Privacy */}
      <Section title="◈ Privacy">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[12px] leading-snug">Lore visibility</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">
              Show your summarized legend on your public profile card. Your
              journal entries always stay private.
            </p>
          </div>
          <button
            role="switch"
            aria-checked={lorePublic}
            aria-label="Toggle lore visibility"
            onClick={toggleLore}
            disabled={savingLore}
            className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors disabled:opacity-60"
            style={{
              background: lorePublic ? "rgba(124,77,255,0.6)" : "var(--border)",
            }}
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: lorePublic ? "translateX(20px)" : "none" }}
            />
          </button>
        </div>
      </Section>

      {/* Danger zone */}
      <div
        className="rounded-sm border p-4 space-y-3"
        style={{
          borderColor: "rgba(224,82,82,0.35)",
          background: "rgba(224,82,82,0.04)",
        }}
      >
        <p
          className="text-[9px] tracking-[0.24em] uppercase flex items-center gap-1.5"
          style={{ fontFamily: "'JetBrains Mono', monospace", color: "#e05252" }}
        >
          <AlertTriangle size={11} /> Danger Zone
        </p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Deleting your account permanently erases your hero, {" "}
          {(hero.archetype?.task_term ?? "quest").toLowerCase()}s, familiar and
          all progress. This cannot be undone.
        </p>
        <button
          onClick={() => setConfirmOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-sm border text-[10px] tracking-[0.16em] uppercase transition-colors mono"
          style={{
            color: "#e05252",
            borderColor: "rgba(224,82,82,0.4)",
            background: "rgba(224,82,82,0.06)",
          }}
        >
          <Trash2 size={12} /> Delete account
        </button>
      </div>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirmOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
            onClick={() => !deleting && setConfirmOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-sm border p-6 space-y-4"
              style={{
                borderColor: "rgba(224,82,82,0.45)",
                background: "var(--card)",
                boxShadow: "0 0 40px rgba(224,82,82,0.15)",
              }}
            >
              <div className="flex items-center gap-2" style={{ color: "#e05252" }}>
                <AlertTriangle size={16} />
                <h4
                  className="text-sm font-bold tracking-[0.14em] uppercase"
                  style={{ fontFamily: "'Cinzel', serif" }}
                >
                  End your legend?
                </h4>
              </div>
              <p className="text-[12px] text-muted-foreground leading-relaxed">
                This permanently deletes <b>{hero.profile.username}</b> and every
                trace of your journey. There is no resurrection.
              </p>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setConfirmOpen(false)}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-sm border border-border text-[10px] tracking-[0.16em] uppercase mono hover:bg-muted/40 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={deleteAccount}
                  disabled={deleting}
                  className="flex-1 py-2.5 rounded-sm border text-[10px] tracking-[0.16em] uppercase mono flex items-center justify-center gap-1.5 transition-colors"
                  style={{
                    color: "#fff",
                    background: "rgba(224,82,82,0.85)",
                    borderColor: "rgba(224,82,82,0.6)",
                  }}
                >
                  {deleting ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Trash2 size={12} />
                  )}
                  Delete forever
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-sm border border-border bg-card/40 p-4 space-y-2">
      <p
        className="text-[9px] tracking-[0.24em] uppercase text-accent"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {title}
      </p>
      {children}
    </div>
  );
}

function SaveBtn({
  onClick,
  disabled,
  loading,
  full,
}: {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  full?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${full ? "w-full py-2.5" : "px-4"} rounded-sm border flex items-center justify-center gap-1.5 text-[10px] tracking-[0.16em] uppercase transition-all disabled:opacity-40`}
      style={{
        fontFamily: "'JetBrains Mono', monospace",
        background: "rgba(124,77,255,0.16)",
        borderColor: "rgba(124,77,255,0.45)",
        color: "var(--accent)",
      }}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
      Save
    </button>
  );
}
