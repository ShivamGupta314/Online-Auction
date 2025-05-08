#!/usr/bin/env node

/**
 * Environment Variable Checker
 * 
 * This script checks if all required environment variables are set.
 * It provides warnings for missing variables and indicates whether they are critical or not.
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Required environment variables grouped by functionality
const requiredVars = {
  core: {
    DATABASE_URL: 'Critical - Database connection string',
    PORT: 'Optional - Server port (defaults to 5000)',
    NODE_ENV: 'Optional - Environment (development, production, test)',
    JWT_SECRET: 'Critical - Secret key for JWT tokens',
    JWT_EXPIRES_IN: 'Optional - JWT token expiration (defaults to 7d)',
    FRONTEND_URL: 'Important - URL to the frontend application for CORS and email links'
  },
  email: {
    EMAIL_HOST: 'Optional - SMTP server host (if not set, emails will be logged)',
    EMAIL_PORT: 'Optional - SMTP server port (defaults to 587)',
    EMAIL_USER: 'Optional - SMTP username',
    EMAIL_PASS: 'Optional - SMTP password',
    EMAIL_FROM: 'Optional - From address for emails'
  },
  payment: {
    STRIPE_SECRET_KEY: 'Important - Stripe API key for payment processing',
    STRIPE_WEBHOOK_SECRET: 'Optional - Stripe webhook secret for event validation'
  },
  cache: {
    REDIS_URL: 'Optional - Redis connection string (if not set, caching will be disabled)'
  }
};

// Color codes for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log('\n');
console.log(`${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.cyan}  ONLINE AUCTION - ENV VARIABLE CHECKER ${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}`);
console.log('\n');

// Track missing variables
let missingCritical = 0;
let missingImportant = 0;
let missingOptional = 0;

// Check each category
for (const [category, vars] of Object.entries(requiredVars)) {
  console.log(`${colors.magenta}[ ${category.toUpperCase()} ]${colors.reset}`);
  
  for (const [varName, description] of Object.entries(vars)) {
    const value = process.env[varName];
    const isSet = !!value;
    const isCritical = description.startsWith('Critical');
    const isImportant = description.startsWith('Important');
    
    if (isSet) {
      // Mask sensitive values
      const displayValue = varName.includes('SECRET') || varName.includes('PASS') 
        ? '********' 
        : value.length > 30 ? value.substring(0, 27) + '...' : value;
      
      console.log(`  ${colors.green}✓${colors.reset} ${varName}: ${colors.green}${displayValue}${colors.reset}`);
    } else {
      if (isCritical) {
        console.log(`  ${colors.red}✗${colors.reset} ${varName}: ${colors.red}MISSING - ${description}${colors.reset}`);
        missingCritical++;
      } else if (isImportant) {
        console.log(`  ${colors.yellow}!${colors.reset} ${varName}: ${colors.yellow}MISSING - ${description}${colors.reset}`);
        missingImportant++;
      } else {
        console.log(`  ${colors.blue}○${colors.reset} ${varName}: ${colors.blue}MISSING - ${description}${colors.reset}`);
        missingOptional++;
      }
    }
  }
  console.log('');
}

// Print summary
console.log(`${colors.cyan}========================================${colors.reset}`);
console.log(`${colors.cyan}  SUMMARY  ${colors.reset}`);
console.log(`${colors.cyan}========================================${colors.reset}`);

if (missingCritical > 0) {
  console.log(`${colors.red}Critical variables missing: ${missingCritical}${colors.reset}`);
  console.log(`${colors.red}The application will NOT run correctly without these!${colors.reset}`);
}

if (missingImportant > 0) {
  console.log(`${colors.yellow}Important variables missing: ${missingImportant}${colors.reset}`);
  console.log(`${colors.yellow}Some functionality will be limited.${colors.reset}`);
}

if (missingOptional > 0) {
  console.log(`${colors.blue}Optional variables missing: ${missingOptional}${colors.reset}`);
  console.log(`${colors.blue}Default values will be used where possible.${colors.reset}`);
}

if (missingCritical === 0 && missingImportant === 0 && missingOptional === 0) {
  console.log(`${colors.green}All environment variables are set!${colors.reset}`);
}

console.log('\n'); 