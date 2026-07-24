-- CreateEnum
CREATE TYPE "ListingKind" AS ENUM ('OFFER', 'WANTED');

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "kind" "ListingKind" NOT NULL DEFAULT 'OFFER';

-- CreateIndex
CREATE INDEX "Listing_kind_idx" ON "Listing"("kind");
