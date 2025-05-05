#!/usr/bin/env node

import fs from 'fs';
import readline from 'readline';
import path from 'path';

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to ask a question
const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Function to generate the .env file
const generateEnvFile = async () => {
  console.log('\n========= Environment Setup for Online Auction Platform =========\n');
  console.log('This script will help you set up your .env file with necessary configurations.');
  console.log('Press Enter to use default values where provided.\n');

  // Database configuration
  console.log('\n=== DATABASE CONFIGURATION ===');
  const dbUser = await askQuestion('Database User (default: postgres): ') || 'postgres';
  const dbPassword = await askQuestion('Database Password (default: postgres): ') || 'postgres';
  const dbHost = await askQuestion('Database Host (default: localhost): ') || 'localhost';
  const dbPort = await askQuestion('Database Port (default: 5432): ') || '5432';
  const dbName = await askQuestion('Database Name (default: auctiondb): ') || 'auctiondb';

  // JWT configuration
  console.log('\n=== JWT CONFIGURATION ===');
  const jwtSecret = await askQuestion('JWT Secret (leave empty to generate a random one): ') || 
    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const jwtExpiry = await askQuestion('JWT Expiry (default: 1d): ') || '1d';

  // Server configuration
  console.log('\n=== SERVER CONFIGURATION ===');
  const port = await askQuestion('Server Port (default: 5001): ') || '5001';
  const nodeEnv = await askQuestion('Node Environment (default: development): ') || 'development';
  const frontendUrl = await askQuestion('Frontend URL (default: http://localhost:3000): ') || 'http://localhost:3000';

  // Stripe configuration
  console.log('\n=== STRIPE CONFIGURATION ===');
  console.log('You can find your Stripe API keys at https://dashboard.stripe.com/apikeys');
  
  const stripeSecretKey = await askQuestion('Stripe Secret Key (starts with sk_test_ or sk_live_): ');
  const stripePublishableKey = await askQuestion('Stripe Publishable Key (starts with pk_test_ or pk_live_): ');
  
  console.log('\nFor webhook secret:');
  console.log('1. Go to https://dashboard.stripe.com/webhooks');
  console.log('2. Click "Add endpoint" and use URL: http://localhost:5001/api/webhooks/stripe');
  console.log('3. Select events: payment_intent.succeeded, payment_intent.payment_failed, charge.refunded');
  console.log('4. Copy the signing secret provided');
  
  const stripeWebhookSecret = await askQuestion('Stripe Webhook Secret (starts with whsec_): ');

  // Email configuration
  console.log('\n=== EMAIL CONFIGURATION (Optional) ===');
  const emailHost = await askQuestion('Email Host (e.g., smtp.gmail.com): ');
  const emailPort = await askQuestion('Email Port (default: 587): ') || '587';
  const emailUser = await askQuestion('Email Username: ');
  const emailPass = await askQuestion('Email Password: ');

  // Generate the .env content
  const envContent = `# Environment variables for Online Auction Platform
# Generated on ${new Date().toISOString()}

# Database Configuration
DATABASE_URL="postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}"

# JWT Authentication
JWT_SECRET="${jwtSecret}"
TOKEN_EXPIRES_IN="${jwtExpiry}"

# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}
FRONTEND_URL="${frontendUrl}"

# Stripe Configuration
STRIPE_SECRET_KEY="${stripeSecretKey}"
STRIPE_PUBLISHABLE_KEY="${stripePublishableKey}"
STRIPE_WEBHOOK_SECRET="${stripeWebhookSecret}"

# Email Configuration
EMAIL_HOST="${emailHost}"
EMAIL_PORT=${emailPort}
EMAIL_USER="${emailUser}"
EMAIL_PASS="${emailPass}"
`;

  // Write to .env file
  const envPath = path.resolve(process.cwd(), '.env');
  
  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`\n✅ .env file successfully created at ${envPath}`);
    console.log('You can edit this file directly if you need to make changes.');
  } catch (error) {
    console.error('Error writing .env file:', error);
  }

  rl.close();
};

// Run the script
generateEnvFile(); 