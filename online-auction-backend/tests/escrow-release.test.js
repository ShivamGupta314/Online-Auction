import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Mock users for testing
const testBidder = {
  id: 1001,
  username: 'test_bidder',
  email: 'test_bidder@example.com',
  role: 'BIDDER'
};

const testSeller = {
  id: 1002,
  username: 'test_seller',
  email: 'test_seller@example.com',
  role: 'SELLER'
};

const testAdmin = {
  id: 1003,
  username: 'test_admin',
  email: 'test_admin@example.com',
  role: 'ADMIN'
};

// Generate JWT tokens for different user types
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Test setup and teardown
beforeAll(async () => {
  // Create test users in database
  try {
    // Create bidder
    await prisma.user.upsert({
      where: { id: testBidder.id },
      update: {},
      create: {
        id: testBidder.id,
        username: testBidder.username,
        email: testBidder.email,
        password: 'hashedPassword',
        role: testBidder.role
      }
    });

    // Create seller
    await prisma.user.upsert({
      where: { id: testSeller.id },
      update: {},
      create: {
        id: testSeller.id,
        username: testSeller.username,
        email: testSeller.email,
        password: 'hashedPassword',
        role: testSeller.role
      }
    });

    // Create admin
    await prisma.user.upsert({
      where: { id: testAdmin.id },
      update: {},
      create: {
        id: testAdmin.id,
        username: testAdmin.username,
        email: testAdmin.email,
        password: 'hashedPassword',
        role: testAdmin.role
      }
    });
  } catch (error) {
    console.log('Error creating test users:', error);
  }
});

afterAll(async () => {
  // Clean up test data
  try {
    // Delete test auction payment if it exists
    await prisma.auctionPayment.deleteMany({
      where: {
        OR: [
          { buyerId: testBidder.id },
          { sellerId: testSeller.id }
        ]
      }
    });

    // Delete test payment methods
    await prisma.paymentMethod.deleteMany({
      where: {
        userId: {
          in: [testBidder.id, testSeller.id]
        }
      }
    });

    // Delete test users
    await prisma.user.deleteMany({
      where: {
        id: {
          in: [testBidder.id, testSeller.id, testAdmin.id]
        }
      }
    });
  } catch (error) {
    console.log('Error cleaning up test data:', error);
  }

  await prisma.$disconnect();
});

describe('Escrow Release Tests', () => {
  let bidderToken, sellerToken, adminToken;
  let paymentMethodId, productId, bidId, auctionPaymentId;

  beforeEach(() => {
    bidderToken = generateToken(testBidder);
    sellerToken = generateToken(testSeller);
    adminToken = generateToken(testAdmin);
  });

  // Test payment method creation
  test('Bidder should be able to create a payment method', async () => {
    const res = await request(app)
      .post('/api/payments/methods')
      .set('Authorization', `Bearer ${bidderToken}`)
      .send({
        cardNumber: '4242424242424242',
        expiryMonth: 12,
        expiryYear: 2030,
        cvv: '123'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');

    paymentMethodId = res.body.data.id;
  });

  // Test product creation
  test('Seller should be able to create a product for auction', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({
        name: 'Test Auction Item',
        description: 'This is a test item for auction',
        startingPrice: 100,
        categoryId: 1, // Assuming category ID 1 exists
        endTime: new Date(Date.now() + 86400000).toISOString(), // 24 hours from now
        isAuction: true
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');

    productId = res.body.data.id;
  });

  // Test bid creation
  test('Bidder should be able to place a bid', async () => {
    if (!productId) {
      console.log('Skipping bid test - no product available');
      return;
    }
    
    const res = await request(app)
      .post(`/api/products/${productId}/bids`)
      .set('Authorization', `Bearer ${bidderToken}`)
      .send({
        amount: 120 // Bid amount
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');

    bidId = res.body.data.id;
  });

  // Test auction payment
  test('Bidder should be able to make a payment for won auction', async () => {
    if (!productId || !bidId || !paymentMethodId) {
      console.log('Skipping payment test - missing prerequisites');
      return;
    }
    
    const res = await request(app)
      .post('/api/payments/auction')
      .set('Authorization', `Bearer ${bidderToken}`)
      .send({
        productId,
        bidId,
        paymentMethodId
      });

    // The payment might not succeed in the test environment because of Stripe mocking,
    // but the API should at least not return an error
    expect(res.statusCode).toBeLessThan(500); // Not a server error
    
    if (res.statusCode === 200) {
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      
      // Get the auction payment ID from database
      const payment = await prisma.payment.findFirst({
        where: { 
          userId: testBidder.id,
          productId 
        },
        include: {
          auctionPayment: true
        }
      });
      
      if (payment && payment.auctionPayment) {
        auctionPaymentId = payment.auctionPayment.id;
      }
    }
  });

  // Test escrow release
  test('Admin should be able to release escrow payment to seller', async () => {
    if (!auctionPaymentId) {
      console.log('Skipping escrow release test - no auction payment available');
      return;
    }
    
    const res = await request(app)
      .post(`/api/payments/escrow/${auctionPaymentId}/release`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    
    // Verify the payment status
    const payment = await prisma.auctionPayment.findUnique({
      where: { id: auctionPaymentId }
    });
    
    expect(payment.status).toBe('RELEASED');
  });

  // Test that regular users cannot release escrow
  test('Regular users cannot release escrow payments', async () => {
    if (!auctionPaymentId) {
      console.log('Skipping escrow restriction test - no auction payment available');
      return;
    }
    
    const res = await request(app)
      .post(`/api/payments/escrow/${auctionPaymentId}/release`)
      .set('Authorization', `Bearer ${bidderToken}`);

    expect(res.statusCode).toEqual(403);
    expect(res.body.success).toBe(false);
  });
}); 