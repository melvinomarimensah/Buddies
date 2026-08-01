# Security posture

## How the app talks to the database

- **All application data** (users, listings, messages, etc.) is read and written
  through **Prisma**, over a direct PostgreSQL connection as the `postgres` owner
  role (`BYPASSRLS = true`). Row Level Security does **not** apply to this path.
- The **Supabase JS client** (`@supabase/ssr`) is used **only for auth** — sessions,
  sign-in, sign-out. It is never used to read or write tables.
- The **service-role key** (`SUPABASE_SERVICE_ROLE_KEY`) is used **server-side only**
  (`lib/supabase/admin.ts`) for Storage uploads. It must never be imported into
  client code or exposed with a `NEXT_PUBLIC_` prefix.

## What protects the database from the public

Supabase exposes a public REST API (PostgREST) and Realtime, both reachable with
the **public anon key** that ships in the browser bundle
(`NEXT_PUBLIC_SUPABASE_ANON_KEY`). The lockdown:

- **Row Level Security is ENABLED on every table** in the `public` schema, with
  **no policies** granting the `anon` / `authenticated` roles any access. RLS
  enabled + zero policies = **deny all**. Every query through the public API
  returns zero rows.
- This is asserted in version control by the migration
  `prisma/migrations/20260728120000_enable_row_level_security`, so it survives
  database resets and fresh/branch environments.
- Verified: `GET /rest/v1/<Table>` with the anon key returns `HTTP 200` with an
  **empty array** for every table.

## The real security boundary: server-side authorization

Because Prisma bypasses RLS, RLS does **not** protect the paths the app actually
uses. The true boundary is the authorization logic in **server actions** and
**server components**. Rules:

- Every server action that touches user-owned data checks ownership or role.
  Examples: message/conversation actions verify the caller is the buyer or seller
  (`lib/actions/messages.ts`); admin actions call `requireAdmin`
  (`lib/actions/admin.ts`).
- The messages page scopes conversations to the signed-in user
  (`where: { OR: [{ buyerId }, { sellerId }] }`).
- When adding a new server action, **always** re-derive the current user from
  `supabase.auth.getUser()` server-side and authorize against it. Never trust an
  id passed from the client without an ownership/role check.

This boundary is covered by an integration test suite (`tests/authorization.test.ts`,
run with `npm test`) that exercises the real server actions against an isolated
local Postgres database (`buddies_test`) with the auth identity mocked. It asserts
that outsiders can't read/send/mark conversations, non-admins can't run admin
actions, deactivation takes effect, and rate limits trip. One-time setup:
`npm run test:setup` (see `.env.test`). Add cases here whenever you add an action
that touches user-owned data — a failing test is the alarm if a refactor reopens a
hole.

## Adding a new table

New Postgres tables default to **RLS OFF**, which would expose them via the public
anon API. Whenever you add a table:

1. Add a migration line: `ALTER TABLE public."<Table>" ENABLE ROW LEVEL SECURITY;`
2. Run `npm run check:rls` — it fails if any public table has RLS disabled. Wire
   this into CI / run it before deploying.

## Rate limiting

Abuse-prone server actions are throttled with an atomic fixed-window limiter
(`lib/rate-limit.ts`) backed by the `RateLimit` table — no external service.
Covered: sign-in and sign-up (per IP), and listing/request creation, message
sending, starting conversations, and reporting (per user). Limits live in
`RATE_LIMITS`. The limiter fails open, so a limiter error never blocks a real
user. For higher scale, this can be swapped for Upstash/Redis behind the same
`rateLimit()` interface.

## Known residual risk (not yet fixed)

- **Realtime chat broadcast channels are not access-controlled.** The chat client
  (`components/messages/messages-view.tsx`) subscribes to `conversation:<id>`
  broadcast channels. Supabase broadcast is open by default, so anyone with the
  anon key who obtains a specific conversation id could subscribe and eavesdrop on
  *new* live messages, or inject fake ones. Conversation ids are unguessable
  (`cuid`) and not exposed to third parties, and the stored message **history** is
  protected by the authorization checks above — so this is defense-in-depth, not an
  open door. Fix: switch to **private channels** (`config: { private: true }` +
  `realtime.setAuth()`) and add an RLS policy on `realtime.messages` that admits
  only conversation participants. Needs live two-user testing.
