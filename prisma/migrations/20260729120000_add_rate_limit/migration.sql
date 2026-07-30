-- CreateTable
CREATE TABLE "RateLimit" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "windowStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RateLimit_pkey" PRIMARY KEY ("key")
);

-- Lock the new table down like every other table: RLS on, no policies, so the
-- public anon REST/Realtime API can neither read nor write it. Prisma (postgres
-- owner) is unaffected. Keeps `npm run check:rls` green.
ALTER TABLE "RateLimit" ENABLE ROW LEVEL SECURITY;
