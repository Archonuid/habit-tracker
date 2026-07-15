-- Mythlog migration v5 — journal → lore & public profile cards.
-- Additive, defensive, and safe to re-run.
--
-- ▶ Paste into Supabase Dashboard → SQL Editor → Run.
--   (Run schema.sql, schema-v2.sql, schema-v3.sql, schema-v4.sql first.)
--
-- Adds: a free-form journal whose entries carry AI-generated lore, a short
-- synthesized lore intro + visibility flag on profiles, and a SECURITY DEFINER
-- function that powers the hover profile card on ranking lists.

-- ────────────────────────────────────────────────
-- JOURNAL_ENTRIES — one row per explicit journal write.
--   `body` = the hero's raw entry, `lore` = its generated in-world retelling.
--   Written defensively: the table may already exist with a partial shape.
-- ────────────────────────────────────────────────
create table if not exists public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  body       text not null,
  lore       text,
  created_at timestamptz not null default now()
);

alter table public.journal_entries add column if not exists body       text;
alter table public.journal_entries add column if not exists lore       text;
alter table public.journal_entries add column if not exists created_at timestamptz default now();

create index if not exists journal_entries_user_created_idx
  on public.journal_entries (user_id, created_at desc);

alter table public.journal_entries enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'journal_entries'
      and policyname = 'Users manage own journal'
  ) then
    create policy "Users manage own journal"
      on public.journal_entries
      for all
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end $$;

-- ────────────────────────────────────────────────
-- PROFILES — accumulated lore intro + its visibility flag.
--   lore_intro : short synthesized "who this hero has become" blurb.
--   lore_public: false = hidden from other players' profile cards (default).
-- ────────────────────────────────────────────────
alter table public.profiles add column if not exists lore_intro  text;
alter table public.profiles add column if not exists lore_public boolean not null default false;

-- ────────────────────────────────────────────────
-- PUBLIC_PROFILE — the card shown when hovering a player on a ranking list.
--   Exposes only presentation fields. lore_intro is returned ONLY when the
--   target hero has opted their lore public.
-- ────────────────────────────────────────────────
create or replace function public.public_profile(p_user_id uuid)
returns table (
  user_id        uuid,
  username       text,
  archetype_name text,
  level          integer,
  xp             bigint,
  lore_intro     text
)
language sql
security definer
set search_path = public
as $$
  select
    p.id,
    p.username,
    a.name as archetype_name,
    p.level,
    p.current_xp::bigint as xp,
    case when p.lore_public then p.lore_intro else null end as lore_intro
  from public.profiles p
  left join public.archetypes a on a.id = p.archetype_id
  where p.id = p_user_id;
$$;

revoke all on function public.public_profile(uuid) from public;
grant execute on function public.public_profile(uuid) to authenticated;
