#!/usr/bin/env node

import { prisma } from '../src/prismaClient.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test user details
const TEST_USER = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123',
  role: 'BIDDER'
};

// Main function
async function createTestUser() {
  console.log('\n===== CREATING TEST USER =====\n');
  
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(TEST_USER.password, salt);
    
    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: TEST_USER.email }
    });
    
    if (existingUser) {
      console.log(`User with email ${TEST_USER.email} already exists with ID: ${existingUser.id}`);
      console.log('You can use this user for testing:');
      console.log(`- Email: ${TEST_USER.email}`);
      console.log(`- Password: ${TEST_USER.password}`);
    } else {
      // Create the user
      const newUser = await prisma.user.create({
        data: {
          username: TEST_USER.username,
          email: TEST_USER.email,
          password: hashedPassword,
          role: TEST_USER.role
        }
      });
      
      console.log(`✅ Test user created successfully with ID: ${newUser.id}`);
      console.log('You can use this user for testing:');
      console.log(`- Email: ${TEST_USER.email}`);
      console.log(`- Password: ${TEST_USER.password}`);
    }
    
    // Create a test package if none exists
    const existingPackages = await prisma.package.count();
    
    if (existingPackages === 0) {
      console.log('\nNo packages found. Creating a test package...');
      
      const testPackage = await prisma.package.create({
        data: {
          name: 'Basic Seller Package',
          description: 'A basic package for testing payments',
          price: 19.99,
          duration: 30,
          listingLimit: 10,
          features: ['10 listings', '30 days access', 'Basic support'],
          isActive: true
        }
      });
      
      console.log(`✅ Test package created with ID: ${testPackage.id}`);
    } else {
      console.log(`\nFound ${existingPackages} existing packages. No need to create test package.`);
    }
    
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createTestUser(); 