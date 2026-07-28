-- Enable Row Level Security (RLS) on every application table in the public schema.
--
-- Why this is safe for the app: all app data access goes through Prisma, which
-- connects as the `postgres` owner role (BYPASSRLS = true). RLS is therefore
-- transparent to the application.
--
-- Why this secures the database: Supabase exposes a public REST API (PostgREST)
-- and Realtime, both reachable with the PUBLIC anon key that ships in the browser
-- bundle. With RLS ENABLED and NO policies granting access, the `anon` and
-- `authenticated` roles behind that public API can read and write NOTHING —
-- every query returns zero rows. This asserts that lockdown in version control so
-- it survives database resets, branch databases, and fresh environments, and so a
-- table added by a later migration is caught (see scripts/check-rls.mjs).
--
-- Enabling RLS on an already-protected table is a no-op, so this migration is
-- idempotent and re-runnable.

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT c.relname
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'                 -- ordinary tables only
      AND c.relname <> '_prisma_migrations'
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.relname);
  END LOOP;
END $$;
