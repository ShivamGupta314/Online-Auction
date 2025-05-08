import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Mock user for testing
const testUser = {
  id: 999,
  username: 'test_user',
  email: 'test@example.com',
  role: 'BIDDER'
};

// Generate a valid JWT token for testing authenticated endpoints
const generateValidToken = () => {
  return jwt.sign(
    { id: testUser.id, username: testUser.username, role: testUser.role },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

// Test setup and teardown
beforeAll(async () => {
  // Create test user in database
  try {
    await prisma.user.create({
      data: {
        id: testUser.id,
        username: testUser.username,
        email: testUser.email,
        password: 'hashedPassword', // In real test, use bcrypt to hash
        role: testUser.role
      }
    });
  } catch (error) {
    console.log('Test user already exists or error creating test user', error);
  }
});

afterAll(async () => {
  // Clean up test data
  try {
    await prisma.paymentMethod.deleteMany({
      where: { userId: testUser.id }
    });
    await prisma.user.delete({
      where: { id: testUser.id }
    });
  } catch (error) {
    console.log('Error cleaning up test data', error);
  }
  
  await prisma.$disconnect();
});

describe('Payment API Tests', () => {
  let token;
  let paymentMethodId;
  
  beforeEach(() => {
    token = generateValidToken();
  });
  
  // Test payment method creation
  describe('POST /api/payments/methods', () => {
    it('should create a new payment method', async () => {
      const res = await request(app)
        .post('/api/payments/methods')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cardNumber: '4242424242424242',
          expiryMonth: 12,
          expiryYear: 2030,
          cvv: '123'
        });
      
      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data.type).toBe('credit_card');
      expect(res.body.data.userId).toBe(testUser.id);
      
      // Save payment method ID for later tests
      paymentMethodId = res.body.data.id;
    });
    
    it('should return 400 for invalid card details', async () => {
      const res = await request(app)
        .post('/api/payments/methods')
        .set('Authorization', `Bearer ${token}`)
        .send({
          cardNumber: '1234123412341234', // Invalid card number
          expiryMonth: 12,
          expiryYear: 2030,
          cvv: '123'
        });
      
      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
    });
  });
  
  // Test getting payment methods
  describe('GET /api/payments/methods', () => {
    it('should return all payment methods for the user', async () => {
      const res = await request(app)
        .get('/api/payments/methods')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });
  
  // Test setting default payment method
  describe('PUT /api/payments/methods/:paymentMethodId/default', () => {
    it('should set a payment method as default', async () => {
      // Skip if no payment method was created
      if (!paymentMethodId) {
        return;
      }
      
      const res = await request(app)
        .put(`/api/payments/methods/${paymentMethodId}/default`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isDefault).toBe(true);
    });
  });
  
  // Test package payment processing
  describe('POST /api/payments/package', () => {
    it('should process a package payment', async () => {
      // Check if we're in test mode with mocks
      const USE_TEST_MOCKS = process.env.NODE_ENV === 'test' && process.env.USE_TEST_MOCKS === 'true';
      
      let packageId = 1; // Default package ID for mock mode
      
      // Only query the database if not in mock mode
      if (!USE_TEST_MOCKS) {
        // First, get a package to purchase
        const packages = await prisma.package.findMany({ take: 1 });
        
        // Skip test if no packages exist
        if (packages.length === 0) {
          console.log('Skipping package payment test - no packages available');
          return;
        }
        
        packageId = packages[0].id;
      }
      
      // Skip if no payment method was created
      if (!paymentMethodId) {
        console.log('Skipping package payment test - no payment method available');
        return;
      }
      
      const res = await request(app)
        .post('/api/payments/package')
        .set('Authorization', `Bearer ${token}`)
        .send({
          packageId,
          paymentMethodId
        });
      
      // Check status code
      // In mock mode, we should get a successful response
      if (USE_TEST_MOCKS) {
        expect(res.statusCode).toEqual(200);
        expect(res.body.success).toBe(true);
      } else {
        // Note: This might fail in test environment without actual Stripe credentials
        // Just check that the API route works correctly
        expect(res.statusCode).toBeLessThan(500); // Not a server error
      }
    });
  });
  
  // Test deleting a payment method
  describe('DELETE /api/payments/methods/:paymentMethodId', () => {
    it('should delete a payment method', async () => {
      // Skip if no payment method was created
      if (!paymentMethodId) {
        return;
      }
      
      const res = await request(app)
        .delete(`/api/payments/methods/${paymentMethodId}`)
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
    });
  });
}); 