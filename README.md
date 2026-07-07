# Buddies

Trade with your people. Buddies is a peer-to-peer marketplace built exclusively for college
students — list, discover, and trade products and services with people on your own campus and
beyond.

This repo covers the foundation, the core marketplace loop, and real-time messaging: marketing
pages, student auth, browse with filters/search, listing detail, the create/edit listing flow,
profile pages, and a realtime chat inbox tied to listings. The admin panel is planned as a
follow-up phase and is not in this build yet.

## Tech stack

- **Framework:** Next.js 15 (App Router) + TypeScript (strict mode)
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Database:** PostgreSQL via Supabase
- **ORM:** Prisma
- **Auth & Storage:** Supabase Auth (email/password) and Supabase Storage
- **Realtime:** Supabase Realtime (broadcast channels for live chat)
- **Forms & validation:** React Hook Form + Zod
- **Motion:** Framer Motion
- **Icons:** lucide-react

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) project
- A PostgreSQL connection string (Supabase provides this — see below)

## 1. Install dependencies

```bash
npm install
```

## 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Under **Project Settings → API**, copy the Project URL, `anon` public key, and `service_role`
   secret key.
3. Under **Project Settings → Database**, copy the pooled connection string (port `6543`) and the
   direct connection string (port `5432`).
4. Under **Storage**, create two **public** buckets:
   - `listing-images` — used for listing photos uploaded from the sell flow.
   - `avatars` — used for profile photos.

   Uploads run through server actions using the `service_role` key, which bypasses Storage
   row-level security — so you do **not** need to add any INSERT policies. The buckets just need
   to exist and be public (so images are readable).
5. Under **Authentication → Sign In / Providers → Email**, keep **"Confirm email"** on for
   production. For local development you can turn it off so new sign-ups log in immediately without
   an email round-trip.
6. Under **Authentication → URL Configuration**, add `http://localhost:3000/auth/callback` as a
   redirect URL (and your production URL once deployed).

## 3. Configure environment variables

Copy the example file and fill in the values from step 2:

```bash
cp .env.example .env
```

| Variable | Description |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-only, never exposed to the client) |
| `DATABASE_URL` | Pooled Postgres connection string (used at runtime) |
| `DIRECT_URL` | Direct Postgres connection string (used for migrations) |
| `NEXT_PUBLIC_SITE_URL` | Base URL of the app, used for auth redirects (`http://localhost:3000` in dev) |

## 4. Set up the database

```bash
npx prisma generate
npx prisma migrate dev
npx prisma db seed
```

The seed script populates 20 universities, product and service categories, a handful of student
accounts, and ~15 sample listings so the app is browsable right away.

> Seeded users are Prisma rows only — they don't have matching Supabase Auth accounts, so you
> can't sign in as them. Create a real account through `/auth/sign-up` to test the authenticated
> flows (selling, favoriting, editing your profile).

## 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/                  Routes (App Router)
  auth/                Sign up, sign in, password reset
  browse/              Marketplace browse + filters
  listings/[id]/       Listing detail
  sell/                Create/edit listing wizard
  u/[username]/        Public profile
  account/             My account (profile, listings, favorites)
components/
  ui/                  shadcn/ui primitives
  marketing/           Landing page sections
  listings/            Listing cards, filters, image upload, sell wizard
  account/             Profile form, avatar upload, listing management
  shared/              Empty states, badges, favorite button, pagination
lib/
  actions/             Server actions (auth, listings, favorites, profile)
  validations/         Zod schemas shared by client forms and server actions
  supabase/            Browser/server/middleware Supabase clients
  data.ts              Cached category/university lookups
  db.ts                Prisma client singleton
prisma/
  schema.prisma        Data model
  seed.ts              Seed script
```

## Notes on current scope

- **Student verification:** sign-up currently lets any email through and asks the student to pick
  their school from a list. Domain-based email verification (auto-marking `isVerified`) is planned
  to be layered on after launch — the `User.isVerified` flag and UI (verified badge) are already in
  place for when that ships.
- **Messaging:** real-time chat is live. "Message seller" opens a conversation anchored to the
  listing + buyer/seller pair, and the `/messages` inbox delivers messages in real time via
  Supabase Realtime broadcast channels (with typing indicators, read receipts, a persistent safety
  banner, and a "Mark as met" flow that flips the listing to `SOLD` once both parties confirm).
- **Admin panel:** not yet built. The `Report` and `AuditLog` models exist in the schema to support
  it later.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `npx prisma studio` | Browse the database visually |
