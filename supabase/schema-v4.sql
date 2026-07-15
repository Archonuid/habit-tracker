-- Mythlog migration v4 — sigils replace the cat/dog familiar.
-- Additive and safe to re-run.
--
-- ▶ Paste into Supabase Dashboard → SQL Editor → Run.
--   (Run schema.sql, schema-v2.sql, schema-v3.sql first.)
--
-- The companion is now an archetype-bound sigil/rune. We no longer collect a
-- species (cat/dog), so `familiars.animal_type` becomes optional. Existing rows
-- keep their old value; new sigils simply omit it. `name` and `personality`
-- still apply — you name your sigil and pick its voice.

alter table public.familiars alter column animal_type drop not null;
