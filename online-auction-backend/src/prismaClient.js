import { PrismaClient } from '@prisma/client'

// Check if we're in test mode with mocks
const USE_TEST_MOCKS = process.env.NODE_ENV === 'test' && process.env.USE_TEST_MOCKS === 'true';

// Export a real or mock Prisma client depending on environment
export const prisma = USE_TEST_MOCKS 
  ? {} // This will be replaced by Jest mock implementation in setup.js
  : new PrismaClient()
