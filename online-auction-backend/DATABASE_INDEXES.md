# Database Indexing Documentation

This document provides an overview of the database indexes implemented in the Online Auction System to optimize query performance.

## Index Overview

Indexes have been added to improve query performance for common operations in the application. The following sections outline the indexes by model and their purposes.

## User Model

| Index | Fields | Purpose |
|-------|--------|---------|
| `role` | Single-column | Optimize filtering users by role (admin, seller, bidder) |
| `email` | Single-column | Improve login performance and email-based lookups |
| `username` | Single-column | Improve username-based lookups and searches |

## Product Model

| Index | Fields | Purpose |
|-------|--------|---------|
| `sellerId` | Single-column | Optimize retrieval of products by seller |
| `categoryId` | Single-column | Accelerate filtering products by category |
| `endTime` | Single-column | Improve queries for ending auctions |
| `startTime` | Single-column | Optimize filtering for upcoming auctions |
| `processed, paymentReceived` | Composite | Faster retrieval of products based on processing status |
| `createdAt` | Single-column | Optimize sorting by creation date (newest/oldest) |
| `minBidPrice` | Single-column | Improve price-based filtering and sorting |
| `name` | Single-column | Optimize search by product name |

## Bid Model

| Index | Fields | Purpose |
|-------|--------|---------|
| `productId` | Single-column | Fast retrieval of bids for a specific product |
| `bidderId` | Single-column | Quickly find bids placed by a specific user |
| `price` | Single-column | Optimize sorting by bid price |
| `createdAt` | Single-column | Improve chronological sorting of bids |
| `productId, price` | Composite | Efficiently find highest/lowest bids for a product |
| `productId, createdAt` | Composite | Optimize retrieval of most recent bids per product |

## Category Model

| Index | Fields | Purpose |
|-------|--------|---------|
| `name` | Single-column | Improve category search by name |

## Package Model

| Index | Fields | Purpose |
|-------|--------|---------|
| `isActive` | Single-column | Quickly filter active packages |
| `price` | Single-column | Optimize price-based sorting and filtering |
| `name` | Single-column | Improve package search by name |

## UserPackage Model

| Index | Fields | Purpose |
|-------|--------|---------|
| `userId` | Single-column | Fast retrieval of packages for a specific user |
| `packageId` | Single-column | Optimize finding users with a specific package |
| `isActive` | Single-column | Quickly filter active user packages |
| `endDate` | Single-column | Improve queries for expiring packages |
| `paymentId` | Single-column | Fast lookup by payment reference |
| `startDate, endDate` | Composite | Optimize date range queries for subscription periods |
| `userId, isActive` | Composite | Efficiently find active packages for a specific user |

## Payment Model

| Index | Fields | Purpose |
|-------|--------|---------|
| `paymentMethodId` | Single-column | Fast lookup of payments by method |
| `status` | Single-column | Quickly filter payments by status |
| `createdAt` | Single-column | Optimize chronological sorting of payments |
| `stripePaymentId` | Single-column | Fast lookup by external payment reference |
| `status, createdAt` | Composite | Efficient filtering of recent payments by status |

## PaymentMethod Model

| Index | Fields | Purpose |
|-------|--------|---------|
| `userId` | Single-column | Fast retrieval of payment methods for a user |
| `stripeCustomerId` | Single-column | Quick lookup by Stripe customer ID |
| `isDefault` | Single-column | Optimize finding default payment methods |
| `userId, isDefault` | Composite | Efficiently find a user's default payment method |
| `userId, type` | Composite | Fast filtering of payment methods by type for a user |

## Transaction Model

| Index | Fields | Purpose |
|-------|--------|---------|
| `paymentId` | Single-column | Fast lookup of transactions for a payment |
| `status` | Single-column | Quickly filter transactions by status |
| `type` | Single-column | Optimize filtering by transaction type |
| `createdAt` | Single-column | Improve chronological sorting of transactions |
| `reference` | Single-column | Fast lookup by external reference |
| `paymentId, status` | Composite | Efficiently filter transactions by status for a payment |
| `type, status` | Composite | Optimize reporting queries by type and status |

## AuctionPayment Model

| Index | Fields | Purpose |
|-------|--------|---------|
| `buyerId` | Single-column | Fast retrieval of payments by buyer |
| `sellerId` | Single-column | Optimize finding payments for a seller |
| `bidId` | Single-column | Quick lookup by associated bid |
| `status` | Single-column | Efficiently filter payments by status |
| `escrowHeld` | Single-column | Fast filtering for payments in escrow |
| `buyerId, status` | Composite | Optimize finding payments with specific status for a buyer |
| `sellerId, status` | Composite | Efficient filtering of payments by status for a seller |

## NewsletterSubscription Model

| Index | Fields | Purpose |
|-------|--------|---------|
| `email` | Single-column | Fast email-based lookups |
| `active` | Single-column | Quickly filter active subscriptions |
| `email, active` | Composite | Efficient checking of subscription status by email |

## Performance Considerations

- These indexes significantly improve query performance but may slightly impact write operations.
- Composite indexes optimize queries that filter on multiple columns simultaneously.
- Single-column indexes improve the performance of sorts, filters, and lookups on individual fields.

## Maintenance

- Periodically analyze query performance to ensure indexes are being utilized effectively.
- Consider removing unused indexes that may impact write performance without providing query benefits.
- When adding new queries to the application, review if additional indexes are needed. 