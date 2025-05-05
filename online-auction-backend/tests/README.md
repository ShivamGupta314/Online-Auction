# Payment Gateway Testing

This directory contains tests for the Online Auction platform, including payment gateway functionality.

## Available Tests

### Payment API Tests
The `payment.test.js` file tests the following API functionality:
- Creating, retrieving, updating, and deleting payment methods
- Processing package payments
- Setting default payment methods

### Webhook Tests
The `webhook.test.js` file tests the Stripe webhook handling for:
- Payment success events
- Payment failure events
- Refund events

### Escrow Release Tests
To test the escrow release functionality specifically, we've created two separate test scripts:

1. **Jest Test**: `escrow-release.test.js` - tests the escrow release API endpoints
2. **Service Test**: `../scripts/test-escrow-service.js` - directly tests the escrow release service functionality

## Running Tests

### All Tests
To run all tests:
```
npm test
```

### Specific Tests
To run a specific test file:
```
npx jest tests/payment.test.js
```

### Escrow Release Service Test
To test the escrow release service specifically:
```
node scripts/test-escrow-service.js
```

## Test Environment

Tests require a properly configured .env file. For testing purposes, you can use the Stripe test keys:
- `STRIPE_SECRET_KEY`: Use a test key starting with `sk_test_`
- `STRIPE_PUBLISHABLE_KEY`: Use a test key starting with `pk_test_`
- `STRIPE_WEBHOOK_SECRET`: For local testing, you can use the Stripe CLI's webhook signing secret

## Mocking

Most tests use mocked Stripe responses to avoid actual API calls during testing. The webhook tests mock the Stripe signature verification process. 