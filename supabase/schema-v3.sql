-- Mythlog migration v3 — cross-user leaderboards & rankings.
-- Additive and safe to re-run.
--
-- ▶ Paste into Supabase Dashboard → SQL Editor → Run.
--   (Run schema.sql and schema-v2.sql first.)
--
-- These functions are SECURITY DEFINER so they can read every player's row to
-- build a ranking. They deliberately expose only leaderboard-appropriate fields
-- (username, archetype, level, period XP) — never emails or auth data.

-- ────────────────────────────────────────────────
-- LEADERBOARD — top players for a period.
--   p_period: 'weekly' (last 7d), 'monthly' (last 30d), or 'all' (total XP).
--   Weekly/monthly XP = habit completions + completed to-dos inside the window.
-- ────────────────────────────────────────────────
create or replace function public.leaderboard(
  p_period text default 'all',
  p_limit  integer default 20
)
returns table (
  user_id        uuid,
  username       text,
  archetype_name text,
  level          integer,
  xp             bigint,
  rank           bigint
)
language sql
security definer
set search_path = public
as $$
  with span as (
    select case p_period
      when 'weekly'  then current_date - 6
      when 'monthly' then current_date - 29
      else null::date
    end as since
  ),
  period_xp as (
    select
      p.id as user_id,
      case
        when (select since from span) is null then p.current_xp::bigint
        else
          coalesce((
            select sum(hc.xp_granted)
            from public.habit_completions hc
            where hc.user_id = p.id
              and hc.completed_on >= (select since from span)
          ), 0)
          + coalesce((
            select sum(t.xp_reward)
            from public.todos t
            where t.user_id = p.id
              and t.done
              and t.done_on >= (select since from span)
          ), 0)
      end as xp
    from public.profiles p
  )
  select
    px.user_id,
    pr.username,
    a.name as archetype_name,
    pr.level,
    px.xp,
    rank() over (order by px.xp desc) as rank
  from period_xp px
  join public.profiles pr on pr.id = px.user_id
  left join public.archetypes a on a.id = pr.archetype_id
  order by px.xp desc, pr.level desc, pr.username asc
  limit greatest(1, least(coalesce(p_limit, 20), 100));
$$;

-- ────────────────────────────────────────────────
-- MY_RANKING — the caller's own rank within a period, plus the field size.
-- ────────────────────────────────────────────────
create or replace function public.my_ranking(p_period text default 'all')
returns table (rank bigint, xp bigint, total_players bigint)
language sql
security definer
set search_path = public
as $$
  with span as (
    select case p_period
      when 'weekly'  then current_date - 6
      when 'monthly' then current_date - 29
      else null::date
    end as since
  ),
  period_xp as (
    select
      p.id as user_id,
      case
        when (select since from span) is null then p.current_xp::bigint
        else
          coalesce((
            select sum(hc.xp_granted)
            from public.habit_completions hc
            where hc.user_id = p.id
              and hc.completed_on >= (select since from span)
          ), 0)
          + coalesce((
            select sum(t.xp_reward)
            from public.todos t
            where t.user_id = p.id
              and t.done
              and t.done_on >= (select since from span)
          ), 0)
      end as xp
    from public.profiles p
  ),
  ranked as (
    select user_id, xp, rank() over (order by xp desc) as rank
    from period_xp
  )
  select r.rank, r.xp, (select count(*) from period_xp) as total_players
  from ranked r
  where r.user_id = auth.uid();
$$;

revoke all on function public.leaderboard(text, integer) from public;
revoke all on function public.my_ranking(text)          from public;
grant execute on function public.leaderboard(text, integer) to authenticated;
grant execute on function public.my_ranking(text)          to authenticated;
