-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('MESSAGE', 'REQUEST_MATCH');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "linkUrl" TEXT NOT NULL,
    "conversationId" TEXT,
    "listingId" TEXT,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_readAt_idx" ON "Notification"("userId", "readAt");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Lock the new table down like every other table: RLS on, no policies, so the
-- public anon REST/Realtime API can neither read nor write it. Prisma (postgres
-- owner) is unaffected. Keeps `npm run check:rls` green.
ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;
