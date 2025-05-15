/*
  Warnings:

  - The values [PAID,DISPUTED] on the enum `AuctionPaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [PACKAGE_PURCHASE,ESCROW_RELEASE,PLATFORM_FEE] on the enum `TransactionType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('BID_PLACED', 'OUTBID', 'AUCTION_WON', 'AUCTION_ENDED', 'PAYMENT_RECEIVED', 'ITEM_SHIPPED', 'GENERAL');

-- AlterEnum
BEGIN;
CREATE TYPE "AuctionPaymentStatus_new" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED', 'RELEASED_TO_SELLER');
ALTER TABLE "AuctionPayment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "AuctionPayment" ALTER COLUMN "status" TYPE "AuctionPaymentStatus_new" USING ("status"::text::"AuctionPaymentStatus_new");
ALTER TYPE "AuctionPaymentStatus" RENAME TO "AuctionPaymentStatus_old";
ALTER TYPE "AuctionPaymentStatus_new" RENAME TO "AuctionPaymentStatus";
DROP TYPE "AuctionPaymentStatus_old";
ALTER TABLE "AuctionPayment" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
BEGIN;
CREATE TYPE "TransactionType_new" AS ENUM ('PAYMENT', 'REFUND', 'CHARGE', 'SUBSCRIPTION', 'AUCTION_PAYMENT');
ALTER TABLE "Transaction" ALTER COLUMN "type" TYPE "TransactionType_new" USING ("type"::text::"TransactionType_new");
ALTER TYPE "TransactionType" RENAME TO "TransactionType_old";
ALTER TYPE "TransactionType_new" RENAME TO "TransactionType";
DROP TYPE "TransactionType_old";
COMMIT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metaData" JSONB,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Watchlist" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- CreateIndex
CREATE INDEX "Notification_createdAt_idx" ON "Notification"("createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Notification_userId_read_idx" ON "Notification"("userId", "read");

-- CreateIndex
CREATE UNIQUE INDEX "Watchlist_userId_productId_key" ON "Watchlist"("userId", "productId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
