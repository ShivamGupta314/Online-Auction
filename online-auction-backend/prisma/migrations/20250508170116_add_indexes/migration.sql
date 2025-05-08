-- CreateIndex
CREATE INDEX "AuctionPayment_buyerId_idx" ON "AuctionPayment"("buyerId");

-- CreateIndex
CREATE INDEX "AuctionPayment_sellerId_idx" ON "AuctionPayment"("sellerId");

-- CreateIndex
CREATE INDEX "AuctionPayment_bidId_idx" ON "AuctionPayment"("bidId");

-- CreateIndex
CREATE INDEX "AuctionPayment_status_idx" ON "AuctionPayment"("status");

-- CreateIndex
CREATE INDEX "AuctionPayment_escrowHeld_idx" ON "AuctionPayment"("escrowHeld");

-- CreateIndex
CREATE INDEX "Bid_productId_idx" ON "Bid"("productId");

-- CreateIndex
CREATE INDEX "Bid_bidderId_idx" ON "Bid"("bidderId");

-- CreateIndex
CREATE INDEX "Bid_price_idx" ON "Bid"("price");

-- CreateIndex
CREATE INDEX "Bid_createdAt_idx" ON "Bid"("createdAt");

-- CreateIndex
CREATE INDEX "Package_isActive_idx" ON "Package"("isActive");

-- CreateIndex
CREATE INDEX "Payment_paymentMethodId_idx" ON "Payment"("paymentMethodId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentId_idx" ON "Payment"("stripePaymentId");

-- CreateIndex
CREATE INDEX "PaymentMethod_userId_idx" ON "PaymentMethod"("userId");

-- CreateIndex
CREATE INDEX "PaymentMethod_stripeCustomerId_idx" ON "PaymentMethod"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "PaymentMethod_isDefault_idx" ON "PaymentMethod"("isDefault");

-- CreateIndex
CREATE INDEX "Product_sellerId_idx" ON "Product"("sellerId");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_endTime_idx" ON "Product"("endTime");

-- CreateIndex
CREATE INDEX "Product_startTime_idx" ON "Product"("startTime");

-- CreateIndex
CREATE INDEX "Product_processed_paymentReceived_idx" ON "Product"("processed", "paymentReceived");

-- CreateIndex
CREATE INDEX "Transaction_paymentId_idx" ON "Transaction"("paymentId");

-- CreateIndex
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- CreateIndex
CREATE INDEX "Transaction_reference_idx" ON "Transaction"("reference");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "UserPackage_userId_idx" ON "UserPackage"("userId");

-- CreateIndex
CREATE INDEX "UserPackage_packageId_idx" ON "UserPackage"("packageId");

-- CreateIndex
CREATE INDEX "UserPackage_isActive_idx" ON "UserPackage"("isActive");

-- CreateIndex
CREATE INDEX "UserPackage_endDate_idx" ON "UserPackage"("endDate");

-- CreateIndex
CREATE INDEX "UserPackage_paymentId_idx" ON "UserPackage"("paymentId");
