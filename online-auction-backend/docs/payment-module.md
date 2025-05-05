# Payment Module Documentation

## Implementation Status
✅ **COMPLETE** - The payment gateway integration is fully implemented and ready for production use.

## Overview
The payment module handles all payment processing for the online auction platform using Stripe as the payment gateway. It supports two main payment flows:

1. **Package Payments**: For sellers to purchase subscription packages
2. **Auction Payments**: For winning bidders to pay for auction items with escrow support

## Environment Configuration
Add the following variables to your `.env` file:

```
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
```

## API Endpoints

### Payment Methods
- `POST /api/payments/methods` - Create a new payment method
- `GET /api/payments/methods` - Get all payment methods for current user
- `PUT /api/payments/methods/:paymentMethodId/default` - Set payment method as default
- `DELETE /api/payments/methods/:paymentMethodId` - Delete a payment method

### Package Payments
- `POST /api/payments/package` - Process a package purchase payment

### Auction Payments
- `POST /api/payments/auction` - Process an auction payment (for winning bid)

### Escrow Management
- `POST /api/payments/escrow/:auctionPaymentId/release` - Release funds from escrow to seller
- `POST /api/payments/escrow/:auctionPaymentId/refund` - Process a refund for an auction payment

### General Payment
- `GET /api/payments/:paymentId` - Get payment details

### Webhooks
- `POST /api/webhooks/stripe` - Endpoint for Stripe webhook events

## Setting Up Stripe Webhooks

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. In the Stripe Dashboard, navigate to Developers > Webhooks
3. Add an endpoint with URL: `https://your-domain.com/api/webhooks/stripe`
4. Select the following events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the signing secret and add it to your `.env` file as `STRIPE_WEBHOOK_SECRET`

## Testing Locally with Stripe CLI

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run `stripe login` to authenticate
3. Forward events to your local server:
   ```
   stripe listen --forward-to localhost:5000/api/webhooks/stripe
   ```
4. Use the provided webhook signing secret in your `.env` file

## Testing with Stripe Test Cards

Use these test card numbers to simulate different payment scenarios:

| Card Number         | Scenario                |
|---------------------|-------------------------|
| 4242 4242 4242 4242 | Successful payment      |
| 4000 0000 0000 0002 | Declined payment        |
| 4000 0000 0000 9995 | Insufficient funds      |
| 4000 0000 0000 3220 | 3D Secure authentication|

For all test cards:
- Use any future date for expiry
- Use any 3-digit CVC
- Use any postal code

## Test Scripts and Tools

The following test utilities are available to verify your payment implementation:

### Automated Tests
- `tests/payment.test.js` - Unit and integration tests for payment API endpoints
- `tests/webhook.test.js` - Tests for Stripe webhook handling

Run the automated tests with:
```
npm test -- --testPathPattern=payment
```

### Manual Testing Script
A manual testing script is provided to help you test the Stripe integration directly:

```
node scripts/test-payment.js
```

This interactive script will:
1. Create a test user (or use an existing one)
2. Create a Stripe customer
3. Add a test payment method
4. Process a test payment
5. Record the payment in the database
6. Optionally clean up test data

### API Testing Tool
An interactive API testing tool is available to test the payment API endpoints:

```
node scripts/test-payment-api.js
```

This tool provides an interactive menu to:
1. Log in to get a JWT token
2. Create payment methods
3. View existing payment methods
4. Process a package payment

Perfect for testing the integration between your frontend and backend.

## Payment Flow

### Package Purchase Flow
1. User selects a package
2. User chooses or adds a payment method
3. Frontend calls `POST /api/payments/package` with package ID and payment method ID
4. Backend creates Stripe payment intent and processes payment
5. User package is activated upon successful payment

### Auction Payment Flow (with Escrow)
1. Auction ends with a winning bid
2. Winning bidder makes payment via `POST /api/payments/auction`
3. Payment is held in escrow
4. When buyer confirms receipt of item, funds are released via `POST /api/payments/escrow/:id/release`
5. If there's a dispute or cancellation, funds can be refunded via `POST /api/payments/escrow/:id/refund`

## Database Models
The payment system uses the following models:
- `Payment`: Stores payment information
- `PaymentMethod`: Stores user payment methods
- `Transaction`: Records all financial transactions
- `AuctionPayment`: Manages auction payments with escrow functionality

## Security Considerations

1. **PCI Compliance**: This implementation follows Stripe's recommended approach where sensitive card data never touches your server.
2. **Webhook Signatures**: All webhook events are verified using Stripe signatures to prevent tampering.
3. **Authentication**: All payment endpoints (except webhooks) require authentication.
4. **Database Encryption**: Consider encrypting sensitive payment data in the database for additional security.

## Production Readiness Checklist

- [x] Stripe integration implemented
- [x] Payment method management
- [x] Package payment processing
- [x] Auction payment processing with escrow
- [x] Webhook handling
- [x] Error handling
- [x] Database schema
- [x] Test files and utilities
- [ ] Configure production Stripe keys
- [ ] Set up production webhook endpoint
- [ ] Enable HTTPS for all payment endpoints 