-- CreateTable
CREATE TABLE "NewsletterSubscription" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "NewsletterSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscription_email_key" ON "NewsletterSubscription"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscription_email_idx" ON "NewsletterSubscription"("email");

-- CreateIndex
CREATE INDEX "NewsletterSubscription_active_idx" ON "NewsletterSubscription"("active");

-- CreateIndex
CREATE INDEX "NewsletterSubscription_email_active_idx" ON "NewsletterSubscription"("email", "active");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "Product_createdAt_idx" ON "Product"("createdAt");

-- CreateIndex
CREATE INDEX "Product_minBidPrice_idx" ON "Product"("minBidPrice");

-- CreateIndex
CREATE INDEX "Bid_productId_price_idx" ON "Bid"("productId", "price");

-- CreateIndex
CREATE INDEX "Bid_productId_createdAt_idx" ON "Bid"("productId", "createdAt");

-- CreateIndex
CREATE INDEX "Category_name_idx" ON "Category"("name");

-- CreateIndex
CREATE INDEX "Package_price_idx" ON "Package"("price");

-- CreateIndex
CREATE INDEX "Package_name_idx" ON "Package"("name");

-- CreateIndex
CREATE INDEX "UserPackage_userId_isActive_idx" ON "UserPackage"("userId", "isActive");

-- CreateIndex
CREATE INDEX "UserPackage_startDate_endDate_idx" ON "UserPackage"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "Payment_status_createdAt_idx" ON "Payment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_isDefault_idx" ON "PaymentMethod"("userId", "isDefault");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_type_idx" ON "PaymentMethod"("userId", "type");

-- CreateIndex
CREATE INDEX "Transaction_paymentId_status_idx" ON "Transaction"("paymentId", "status");

-- CreateIndex
CREATE INDEX "Transaction_type_status_idx" ON "Transaction"("type", "status");

-- CreateIndex
CREATE INDEX "AuctionPayment_buyerId_status_idx" ON "AuctionPayment"("buyerId", "status");

-- CreateIndex
CREATE INDEX "AuctionPayment_sellerId_status_idx" ON "AuctionPayment"("sellerId", "status");
