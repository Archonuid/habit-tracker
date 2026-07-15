"use client";

import { useState } from "react";
import * as HoverCard from "@radix-ui/react-hover-card";
import { Loader2, ScrollText, ShieldHalf } from "lucide-react";
import { createClient } from "@/app/lib/supabase/client";
import { rankTier } from "@/app/lib/ranks";
import { archetypeStyle } from "@/app/lib/constants";

interface PublicProfile {
  user_id: string;
  username: string | null;
  archetype_name: string | null;
  level: number;
  xp: number;
  lore_intro: string | null;
}

/**
 * Wraps a leaderboard name in a hover card that lazily fetches a public profile
 * (via the public_profile RPC) and shows archetype rank, level, XP and — only
 * if that hero opted their lore public — their summarized legend.
 */
export function ProfileHoverCard({
  userId,
  xpTerm,
  children,
}: {
  userId: string;
  xpTerm: string;
  children: React.ReactNode;
}) {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const fetchProfile = async () => {
    if (loaded || loading) return;
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase.rpc("public_profile", {
      p_user_id: userId,
    });
    setProfile(((data as PublicProfile[]) ?? [])[0] ?? null);
    setLoading(false);
    setLoaded(true);
  };

  return (
    <HoverCard.Root
      openDelay={200}
      closeDelay={100}
      onOpenChange={(open) => open && fetchProfile()}
    >
      <HoverCard.Trigger asChild>{children}</HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          side="top"
          align="start"
          sideOffset={6}
          className="z-50 w-64 rounded-sm border border-border bg-card p-4 shadow-xl"
          style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}
        >
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="animate-spin text-muted-foreground" size={16} />
            </div>
          ) : profile ? (
            <ProfileBody profile={profile} xpTerm={xpTerm} />
          ) : (
            <p className="text-[11px] text-muted-foreground text-center py-2">
              Hero not found.
            </p>
          )}
          <HoverCard.Arrow className="fill-border" />
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
}

function ProfileBody({
  profile,
  xpTerm,
}: {
  profile: PublicProfile;
  xpTerm: string;
}) {
  const style = archetypeStyle(profile.archetype_name);
  const tier = rankTier(profile.level, profile.archetype_name);

  return (
    <div className="space-y-3">
      {/* Identity */}
      <div className="flex items-center gap-2.5">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-sm border flex-shrink-0"
          style={{
            borderColor: `${tier.color}66`,
            background: `${tier.color}18`,
          }}
        >
          <span
            className="text-lg font-bold leading-none"
            style={{ fontFamily: "'Cinzel', serif", color: tier.color }}
          >
            {tier.letter}
          </span>
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold truncate">
            {profile.username ?? "Nameless Hero"}
          </p>
          <p
            className="text-[8px] tracking-[0.14em] uppercase truncate"
            style={{ fontFamily: "'JetBrains Mono', monospace", color: style.color }}
          >
            {profile.archetype_name ?? "Unaligned"} · {tier.name}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4">
        <Stat icon={<ShieldHalf size={10} />} label="Level" value={String(profile.level)} />
        <Stat label={xpTerm} value={profile.xp.toLocaleString()} />
      </div>

      {/* Lore intro (only present when public) */}
      {profile.lore_intro ? (
        <div className="pt-2 border-t border-border/60 space-y-1.5">
          <p
            className="text-[8px] tracking-[0.2em] uppercase text-accent flex items-center gap-1"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            <ScrollText size={9} /> Legend
          </p>
          <p className="text-[11px] leading-relaxed text-muted-foreground serif">
            {profile.lore_intro}
          </p>
        </div>
      ) : (
        <p
          className="pt-2 border-t border-border/60 text-[9px] tracking-[0.14em] uppercase text-muted-foreground/60"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          ◈ Legend sealed
        </p>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p
        className="text-[8px] tracking-[0.16em] uppercase text-muted-foreground flex items-center gap-1"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {icon}
        {label}
      </p>
      <p
        className="text-sm font-bold tabular-nums"
        style={{ fontFamily: "'Cinzel', serif" }}
      >
        {value}
      </p>
    </div>
  );
}
