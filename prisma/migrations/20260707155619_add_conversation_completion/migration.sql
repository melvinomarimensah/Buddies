-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "buyerCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sellerCompleted" BOOLEAN NOT NULL DEFAULT false;
