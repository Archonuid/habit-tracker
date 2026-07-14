-- Mythlog reconciliation migration
-- Your project already has: profiles, archetypes, familiars, habits,
-- habit_completions, user_interests, journal_entries.
-- This script FIXES the broken signup trigger ("Database error saving new user")
-- and ADDS the missing pieces the app needs. It does not drop any tables or data.
--
-- ▶ Paste this whole file into Supabase Dashboard → SQL Editor → Run.
--   Safe to re-run.

-- ────────────────────────────────────────────────
-- 1. FIX SIGNUP — replace whatever trigger is currently failing on
--    auth.users with a minimal, safe profile-creator.
-- ────────────────────────────────────────────────
do $$
declare t record;
begin
  for t in
    select tgname from pg_trigger
    where tgrelid = 'auth.users'::regclass and not tgisinternal
  loop
    execute format('drop trigger if exists %I on auth.users', t.tgname);
  end loop;
end $$;

-- Make sure a bare insert of (id) can never violate constraints.
do $$ begin
  alter table public.profiles alter column username drop not null;
exception when others then null; end $$;
do $$ begin
  alter table public.profiles alter column archetype_id drop not null;
exception when others then null; end $$;
alter table public.profiles alter column onboarding_done set default false;
alter table public.profiles alter column level set default 1;
alter table public.profiles alter column current_xp set default 0;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any existing users.
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- ────────────────────────────────────────────────
-- 2. FAMILIARS — add the cat/dog choice + one familiar per user (for upsert)
-- ────────────────────────────────────────────────
-- Your familiars table already has `animal_type` (accepts 'cat'/'dog') and a
-- NOT NULL `personality`. The original personality CHECK constraint only allows
-- a fixed set that rejects the app's anime personalities (genki, tsundere, …),
-- so drop it and let the app own the list.
alter table public.familiars drop constraint if exists familiars_personality_check;
-- Remove the redundant `species` column an earlier version of this script added
-- (the real column is animal_type).
alter table public.familiars drop constraint if exists familiars_species_check;
alter table public.familiars drop column if exists species;
-- One familiar per user, so the app can upsert on user_id.
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'familiars_user_id_unique'
  ) then
    alter table public.familiars
      add constraint familiars_user_id_unique unique (user_id);
  end if;
end $$;

-- ────────────────────────────────────────────────
-- 3. HABIT COMPLETIONS — once-per-day guard + XP bookkeeping
-- ────────────────────────────────────────────────
-- Your completions table already stores XP in `xp_granted` (NOT NULL). Add a
-- `completed_on` date so we can enforce one completion per habit per day.
alter table public.habit_completions
  add column if not exists completed_on date not null default current_date;
-- Drop the redundant `xp_awarded` column an earlier version of this script added.
alter table public.habit_completions drop column if exists xp_awarded;
do $$ begin
  alter table public.habit_completions alter column completed_at set default now();
exception when others then null; end $$;
create unique index if not exists habit_completions_once_daily
  on public.habit_completions (habit_id, completed_on);

-- Habits: give optional columns safe defaults so inserts of
-- (user_id, title, xp_reward) always succeed.
do $$ begin
  alter table public.habits alter column is_active set default true;
exception when others then null; end $$;
do $$ begin
  alter table public.habits alter column frequency set default 'daily';
exception when others then null; end $$;
do $$ begin
  alter table public.habits alter column frequency drop not null;
exception when others then null; end $$;
do $$ begin
  alter table public.habits alter column description drop not null;
exception when others then null; end $$;

-- ────────────────────────────────────────────────
-- 4. LEVEL CURVE — total XP to reach level L is 50·L·(L−1)
--    (level 2 at 100 XP, level 3 at 300, level 4 at 600, level 5 at 1000 …)
--    Must stay in sync with src/app/lib/xp.ts
-- ────────────────────────────────────────────────
create or replace function public.level_from_xp(p_xp integer)
returns integer
language sql immutable
as $$
  select floor((1 + sqrt(1 + 0.08 * greatest(p_xp, 0))) / 2)::integer;
$$;

-- ────────────────────────────────────────────────
-- 5. COMPLETE HABIT — atomic: records today's completion, awards XP,
--    recomputes level. Awards 0 if already completed today.
-- ────────────────────────────────────────────────
create or replace function public.complete_habit(p_habit_id uuid)
returns table (awarded integer, new_xp integer, new_level integer, leveled_up boolean)
language plpgsql
security invoker
as $$
declare
  v_reward    integer;
  v_old_level integer;
  v_new_xp    integer;
  v_new_level integer;
  v_inserted  boolean;
begin
  select h.xp_reward into v_reward
  from public.habits h
  where h.id = p_habit_id and h.user_id = auth.uid();

  if v_reward is null then
    raise exception 'Habit not found';
  end if;

  insert into public.habit_completions (habit_id, user_id, xp_granted)
  values (p_habit_id, auth.uid(), v_reward)
  on conflict (habit_id, completed_on) do nothing;
  v_inserted := found;

  if not v_inserted then
    select p.current_xp, p.level into v_new_xp, v_new_level
    from public.profiles p where p.id = auth.uid();
    return query select 0, v_new_xp, v_new_level, false;
    return;
  end if;

  select p.level into v_old_level from public.profiles p where p.id = auth.uid();

  update public.profiles p
  set current_xp = p.current_xp + v_reward,
      level = public.level_from_xp(p.current_xp + v_reward),
      updated_at = now()
  where p.id = auth.uid()
  returning p.current_xp, p.level into v_new_xp, v_new_level;

  return query select v_reward, v_new_xp, v_new_level, (v_new_level > v_old_level);
end;
$$;

-- ────────────────────────────────────────────────
-- 6. RLS POLICIES — recreate the ones the app relies on (idempotent)
-- ────────────────────────────────────────────────
alter table public.profiles enable row level security;
drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

alter table public.familiars enable row level security;
drop policy if exists "Users manage own familiar" on public.familiars;
create policy "Users manage own familiar"
  on public.familiars for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.user_interests enable row level security;
drop policy if exists "Users manage own interests" on public.user_interests;
create policy "Users manage own interests"
  on public.user_interests for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.habits enable row level security;
drop policy if exists "Users manage own habits" on public.habits;
create policy "Users manage own habits"
  on public.habits for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table public.habit_completions enable row level security;
drop policy if exists "Users manage own completions" on public.habit_completions;
create policy "Users manage own completions"
  on public.habit_completions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Archetypes are a public lookup table — everyone can read them.
alter table public.archetypes enable row level security;
drop policy if exists "Archetypes are readable by everyone" on public.archetypes;
create policy "Archetypes are readable by everyone"
  on public.archetypes for select using (true);
