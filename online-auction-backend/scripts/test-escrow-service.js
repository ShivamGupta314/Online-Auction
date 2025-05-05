#!/usr/bin/env node

import { prisma } from '../src/prismaClient.js';
import * as paymentService from '../src/services/payment.service.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test user IDs
const BIDDER_ID = 2001;
const SELLER_ID = 2002;

// Main test function
async function testEscrowRelease() {
  console.log('Starting escrow release service test...');
  
  try {
    // Setup test environment
    await setupTestData();
    
    // Create a mock auction payment (simulate a completed auction payment)
    const auctionPayment = await createMockAuctionPayment();
    console.log(`Created mock auction payment with ID: ${auctionPayment.id}`);
    
    // Test releasing the escrow
    console.log('Testing escrow release...');
    const releasedPayment = await paymentService.releaseEscrow(auctionPayment.id);
    
    console.log('Escrow release result:', {
      id: releasedPayment.id,
      status: releasedPayment.status,
      amount: releasedPayment.amount,
      sellerId: releasedPayment.sellerId
    });
    
    // Verify the payment status
    if (releasedPayment.status === 'RELEASED_TO_SELLER') {
      console.log('✅ SUCCESS: Escrow released successfully!');
    } else {
      console.log('❌ FAIL: Escrow not released correctly. Status:', releasedPayment.status);
    }
    
  } catch (error) {
    console.error('❌ ERROR in escrow release test:', error);
  } finally {
    // Clean up test data
    await cleanupTestData();
    
    // Close Prisma connection
    await prisma.$disconnect();
  }
}

// Setup test data (users, etc.)
async function setupTestData() {
  console.log('Setting up test data...');
  
  // Create test bidder
  try {
    await prisma.user.upsert({
      where: { id: BIDDER_ID },
      update: {},
      create: {
        id: BIDDER_ID,
        username: 'test_escrow_bidder',
        email: 'test_escrow_bidder@example.com',
        password: 'hashedPassword',
        role: 'BIDDER'
      }
    });
    console.log('Created test bidder');
    
    // Create test seller
    await prisma.user.upsert({
      where: { id: SELLER_ID },
      update: {},
      create: {
        id: SELLER_ID,
        username: 'test_escrow_seller',
        email: 'test_escrow_seller@example.com',
        password: 'hashedPassword',
        role: 'SELLER'
      }
    });
    console.log('Created test seller');
    
    // Create a test category if needed
    const category = await prisma.category.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        name: 'Test Category'
      }
    });
    console.log('Created test category');
    
  } catch (error) {
    console.error('Error setting up test users:', error);
    throw error;
  }
}

// Create a mock auction payment for testing
async function createMockAuctionPayment() {
  console.log('Creating mock auction payment...');
  
  try {
    // Create a test product
    const product = await prisma.product.create({
      data: {
        name: 'Test Escrow Product',
        description: 'This is a test product for escrow release',
        photoUrl: 'https://example.com/test-product.jpg', // Required field
        minBidPrice: 100.00,
        startTime: new Date(Date.now() - 86400000 * 2), // Started 2 days ago
        endTime: new Date(Date.now() - 86400000), // Ended yesterday
        sellerId: SELLER_ID,
        categoryId: 1, // Use the category we created
        processed: true,
        paymentReceived: false
      }
    });
    console.log('Created test product');
    
    // Create a test bid (winning bid)
    const bid = await prisma.bid.create({
      data: {
        price: 150.00,
        productId: product.id,
        bidderId: BIDDER_ID
      }
    });
    console.log('Created test bid');
    
    // Create a test payment method
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        type: 'credit_card',
        userId: BIDDER_ID,
        lastFourDigits: '4242',
        expiryMonth: 12,
        expiryYear: 2030,
        isDefault: true
      }
    });
    console.log('Created test payment method');
    
    // Create a test payment
    const payment = await prisma.payment.create({
      data: {
        amount: 150.00,
        currency: 'USD',
        status: 'COMPLETED',
        paymentMethodId: paymentMethod.id,
        stripePaymentId: 'mock_stripe_payment_id_' + Date.now(),
        transactions: {
          create: {
            amount: 150.00,
            status: 'COMPLETED',
            type: 'AUCTION_PAYMENT',
            description: 'Payment for auction item: Test Escrow Product'
          }
        }
      }
    });
    console.log('Created test payment');
    
    // Create the auction payment (escrow)
    const auctionPayment = await prisma.auctionPayment.create({
      data: {
        paymentId: payment.id,
        productId: product.id,
        buyerId: BIDDER_ID,
        sellerId: SELLER_ID,
        bidId: bid.id,
        status: 'PAID',
        escrowHeld: true
      }
    });
    console.log('Created test auction payment');
    
    return auctionPayment;
  } catch (error) {
    console.error('Error creating mock auction payment:', error);
    throw error;
  }
}

// Clean up test data
async function cleanupTestData() {
  console.log('Cleaning up test data...');
  
  try {
    // Find the auction payment
    const auctionPayment = await prisma.auctionPayment.findFirst({
      where: {
        sellerId: SELLER_ID,
        buyerId: BIDDER_ID
      },
      include: {
        payment: {
          include: {
            transactions: true
          }
        },
        product: true
      }
    });
    
    if (auctionPayment) {
      // Delete transactions
      if (auctionPayment.payment?.transactions) {
        await prisma.transaction.deleteMany({
          where: {
            paymentId: auctionPayment.payment.id
          }
        });
      }
      
      // Delete auction payment
      await prisma.auctionPayment.delete({
        where: {
          id: auctionPayment.id
        }
      });
      
      // Delete payment
      if (auctionPayment.payment) {
        await prisma.payment.delete({
          where: {
            id: auctionPayment.payment.id
          }
        });
      }
      
      // Delete bids
      await prisma.bid.deleteMany({
        where: {
          productId: auctionPayment.productId
        }
      });
      
      // Delete product
      await prisma.product.delete({
        where: {
          id: auctionPayment.productId
        }
      });
    }
    
    // Delete payment methods
    await prisma.paymentMethod.deleteMany({
      where: {
        userId: BIDDER_ID
      }
    });
    
    // Delete users
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [BIDDER_ID, SELLER_ID]
        }
      }
    });
    
    console.log('Test data cleanup complete');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

// Run the test
testEscrowRelease(); 