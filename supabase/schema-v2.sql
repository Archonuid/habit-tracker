-- Mythlog migration v2 — habit scheduling, pause/archive, to-dos,
-- undo (uncomplete), and permanent account deletion.
-- This is ADDITIVE and safe to re-run. It does not drop tables or data.
--
-- ▶ Paste this whole file into Supabase Dashboard → SQL Editor → Run.
--   (Run supabase/schema.sql first if you haven't — this builds on it.)

-- ────────────────────────────────────────────────
-- 1. HABITS — scheduling + lifecycle (pause / archive)
-- ────────────────────────────────────────────────
-- weekdays: JS getDay() convention (0=Sun … 6=Sat).
--   NULL or empty array = every day. Otherwise the specific days it's due.
alter table public.habits add column if not exists weekdays smallint[];
alter table public.habits add column if not exists is_paused boolean not null default false;
alter table public.habits add column if not exists archived_at timestamptz;

-- ────────────────────────────────────────────────
-- 2. TODOS — one-off tasks (no streaks, just a checklist)
-- ────────────────────────────────────────────────
create table if not exists public.todos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  title      text not null,
  xp_reward  integer not null default 10,
  done       boolean not null default false,
  done_on    date,
  created_at timestamptz not null default now()
);

alter table public.todos enable row level security;
drop policy if exists "Users manage own todos" on public.todos;
create policy "Users manage own todos"
  on public.todos for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ────────────────────────────────────────────────
-- 3. COMPLETE / UNCOMPLETE TODO — award XP once, allow undo
-- ────────────────────────────────────────────────
create or replace function public.complete_todo(p_todo_id uuid)
returns table (awarded integer, new_xp integer, new_level integer, leveled_up boolean)
language plpgsql security invoker
as $$
declare
  v_reward    integer;
  v_done      boolean;
  v_old_level integer;
  v_new_xp    integer;
  v_new_level integer;
begin
  select t.xp_reward, t.done into v_reward, v_done
  from public.todos t where t.id = p_todo_id and t.user_id = auth.uid();
  if v_reward is null then raise exception 'Todo not found'; end if;

  if v_done then
    select p.current_xp, p.level into v_new_xp, v_new_level
    from public.profiles p where p.id = auth.uid();
    return query select 0, v_new_xp, v_new_level, false;
    return;
  end if;

  update public.todos set done = true, done_on = current_date
  where id = p_todo_id and user_id = auth.uid();

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

create or replace function public.uncomplete_todo(p_todo_id uuid)
returns table (new_xp integer, new_level integer)
language plpgsql security invoker
as $$
declare
  v_reward    integer;
  v_done      boolean;
  v_new_xp    integer;
  v_new_level integer;
begin
  select t.xp_reward, t.done into v_reward, v_done
  from public.todos t where t.id = p_todo_id and t.user_id = auth.uid();
  if v_reward is null then raise exception 'Todo not found'; end if;

  update public.todos set done = false, done_on = null
  where id = p_todo_id and user_id = auth.uid();

  if not v_done then
    select p.current_xp, p.level into v_new_xp, v_new_level
    from public.profiles p where p.id = auth.uid();
    return query select v_new_xp, v_new_level;
    return;
  end if;

  update public.profiles p
  set current_xp = greatest(0, p.current_xp - v_reward),
      level = public.level_from_xp(greatest(0, p.current_xp - v_reward)),
      updated_at = now()
  where p.id = auth.uid()
  returning p.current_xp, p.level into v_new_xp, v_new_level;

  return query select v_new_xp, v_new_level;
end;
$$;

-- ────────────────────────────────────────────────
-- 4. UNCOMPLETE HABIT — undo today's completion (fix a mis-tap), refund XP
-- ────────────────────────────────────────────────
create or replace function public.uncomplete_habit(p_habit_id uuid)
returns table (removed integer, new_xp integer, new_level integer)
language plpgsql security invoker
as $$
declare
  v_reward    integer;
  v_new_xp    integer;
  v_new_level integer;
begin
  delete from public.habit_completions
  where habit_id = p_habit_id and user_id = auth.uid() and completed_on = current_date
  returning xp_granted into v_reward;

  if v_reward is null then
    select p.current_xp, p.level into v_new_xp, v_new_level
    from public.profiles p where p.id = auth.uid();
    return query select 0, v_new_xp, v_new_level;
    return;
  end if;

  update public.profiles p
  set current_xp = greatest(0, p.current_xp - v_reward),
      level = public.level_from_xp(greatest(0, p.current_xp - v_reward)),
      updated_at = now()
  where p.id = auth.uid()
  returning p.current_xp, p.level into v_new_xp, v_new_level;

  return query select v_reward, v_new_xp, v_new_level;
end;
$$;

-- ────────────────────────────────────────────────
-- 5. DELETE OWN ACCOUNT — permanent, irreversible wipe.
--    security definer so it can remove the auth.users row. Deletes all of
--    the caller's data first so it succeeds regardless of FK cascade config.
-- ────────────────────────────────────────────────
create or replace function public.delete_own_account()
returns void
language plpgsql security definer set search_path = public
as $$
declare uid uuid := auth.uid();
begin
  if uid is null then raise exception 'Not authenticated'; end if;

  delete from public.habit_completions where user_id = uid;
  delete from public.habits            where user_id = uid;
  delete from public.todos             where user_id = uid;
  delete from public.familiars         where user_id = uid;
  delete from public.user_interests    where user_id = uid;
  begin
    delete from public.journal_entries where user_id = uid;
  exception when others then null; -- table/column shape not guaranteed
  end;
  delete from public.profiles          where id = uid;
  delete from auth.users               where id = uid;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;
