#!/usr/bin/env node

import { prisma } from '../src/prismaClient.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test seller details
const TEST_SELLER = {
  username: 'testseller',
  email: 'seller@example.com',
  password: 'password123',
  role: 'SELLER',
  id: 100 // Using a specific ID for our tests
};

// Main function
async function createTestSeller() {
  console.log('\n===== CREATING TEST SELLER =====\n');
  
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(TEST_SELLER.password, salt);
    
    // Check if the seller already exists
    const existingSeller = await prisma.user.findUnique({
      where: { email: TEST_SELLER.email }
    });
    
    if (existingSeller) {
      console.log(`Seller with email ${TEST_SELLER.email} already exists with ID: ${existingSeller.id}`);
      console.log('You can use this seller for testing:');
      console.log(`- Email: ${TEST_SELLER.email}`);
      console.log(`- Password: ${TEST_SELLER.password}`);
    } else {
      // Create the seller
      const newSeller = await prisma.user.upsert({
        where: { id: TEST_SELLER.id },
        update: {
          username: TEST_SELLER.username,
          email: TEST_SELLER.email,
          password: hashedPassword,
          role: TEST_SELLER.role
        },
        create: {
          id: TEST_SELLER.id,
          username: TEST_SELLER.username,
          email: TEST_SELLER.email,
          password: hashedPassword,
          role: TEST_SELLER.role
        }
      });
      
      console.log(`✅ Test seller created successfully with ID: ${newSeller.id}`);
      console.log('You can use this seller for testing:');
      console.log(`- Email: ${TEST_SELLER.email}`);
      console.log(`- Password: ${TEST_SELLER.password}`);
    }
    
    // Ensure category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id: 1 }
    });
    
    if (!existingCategory) {
      console.log('\nCreating test category...');
      
      const testCategory = await prisma.category.create({
        data: {
          id: 1,
          name: 'Test Category'
        }
      });
      
      console.log(`✅ Test category created with ID: ${testCategory.id}`);
    } else {
      console.log(`\nFound existing category with ID: ${existingCategory.id}`);
    }
    
  } catch (error) {
    console.error('Error creating test seller:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestSeller(); 