import { PrismaClient } from '@prisma/client';
import { prisma as sharedPrisma } from '../src/prismaClient.js';

async function testPrismaConnection() {
  console.log('Testing Prisma database connection...');
  
  try {
    // First, try with a new Prisma client instance
    console.log('Testing with a new Prisma client instance:');
    const localPrisma = new PrismaClient();
    
    // Test connection by querying the user we created
    const usersFromLocal = await localPrisma.user.findMany({
      where: { email: 'test@example.com' },
      take: 1
    });
    
    console.log('Local Prisma connection result:', usersFromLocal.length ? 'Success' : 'No users found');
    if (usersFromLocal.length) {
      console.log('User found:', usersFromLocal[0].email);
    }
    
    // Now try with the shared Prisma client
    console.log('\nTesting with the shared Prisma client:');
    const usersFromShared = await sharedPrisma.user.findMany({
      where: { email: 'test@example.com' },
      take: 1
    });
    
    console.log('Shared Prisma connection result:', usersFromShared.length ? 'Success' : 'No users found');
    if (usersFromShared.length) {
      console.log('User found:', usersFromShared[0].email);
    }
    
    // Close the connections
    await localPrisma.$disconnect();
  } catch (error) {
    console.error('Prisma connection test failed:', error);
  }
}

testPrismaConnection(); 