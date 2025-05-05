# Environment Setup Guide

This document explains how to set up environment variables for the online auction platform, particularly for the payment integration.

## Required Environment Variables

Create a `.env` file in the project root (online-auction-backend) with the following variables:

```
# Database Configuration
DATABASE_URL="postgresql://postgres:password@localhost:5432/auctiondb"

# JWT Authentication
JWT_SECRET="your-secret-jwt-token"
TOKEN_EXPIRES_IN="1d"

# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"

# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"

# Stripe Account Settings (for marketplace/platform features if used)
STRIPE_PLATFORM_ACCOUNT="acct_your_platform_account"
STRIPE_PLATFORM_FEE_PERCENTAGE=5

# Email Configuration (for notifications)
EMAIL_HOST="smtp.example.com"
EMAIL_PORT=587
EMAIL_USER="your-email@example.com"
EMAIL_PASS="your-email-password"
```

## Obtaining Stripe API Keys

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Log in to the Stripe Dashboard
3. Go to Developers → API keys
4. You'll see two types of keys:
   - **Publishable Key**: Starts with `pk_`. Used in your frontend code.
   - **Secret Key**: Starts with `sk_`. Used in your backend code.

Stripe provides both **test** keys (starting with `pk_test_` and `sk_live_`) and **live** keys (starting with `pk_live_` and `sk_live_`).

## Setting Up Stripe Webhooks

1. In the Stripe Dashboard, go to Developers → Webhooks
2. Click "Add endpoint"
3. Enter the webhook URL for your application:
   - Development: `http://localhost:5001/api/webhooks/stripe`
   - Production: `https://your-domain.com/api/webhooks/stripe`
4. Select the events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. After creating the webhook, Stripe will show a signing secret. Copy this value and use it as your `STRIPE_WEBHOOK_SECRET` in the `.env` file.

## Testing Locally with Stripe CLI

For local development and testing:

1. Install the [Stripe CLI](https://stripe.com/docs/stripe-cli)
2. Run `stripe login` to authenticate
3. Forward events to your local server:
   ```
   stripe listen --forward-to localhost:5001/api/webhooks/stripe
   ```
4. The CLI will provide a webhook signing secret. Use this as your `STRIPE_WEBHOOK_SECRET` in the `.env` file during development.

## Production vs Development

- Use `sk_test_` and `pk_test_` keys for development and testing
- Use `sk_live_` and `pk_live_` keys for production
- Always keep your secret keys secure and never expose them in client-side code
- Set different webhook endpoints for development and production environments

## Additional Stripe Features

For a marketplace model (where you take a fee from sellers):
1. Set up Stripe Connect to manage multiple connected accounts
2. Configure `STRIPE_PLATFORM_ACCOUNT` with your platform account ID
3. Set `STRIPE_PLATFORM_FEE_PERCENTAGE` to your desired fee (e.g., 5 for 5%) 