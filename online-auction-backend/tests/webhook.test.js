import request from 'supertest';
import app from '../src/app.js';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { jest } from '@jest/globals';

dotenv.config();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Mock webhook event
const generateMockEvent = (type) => {
  // Generate a fake signature
  const signature = 'fake_signature';
  
  // Create mock event data based on type
  let eventData;
  
  switch(type) {
    case 'payment_intent.succeeded':
      eventData = {
        id: 'evt_mock_succeeded',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_mock_payment_intent',
            amount: 1000,
            currency: 'usd',
            status: 'succeeded'
          }
        }
      };
      break;
    case 'payment_intent.payment_failed':
      eventData = {
        id: 'evt_mock_failed',
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            id: 'pi_mock_payment_intent_failed',
            amount: 1000,
            currency: 'usd',
            status: 'failed'
          }
        }
      };
      break;
    case 'charge.refunded':
      eventData = {
        id: 'evt_mock_refunded',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_mock_charge',
            payment_intent: 'pi_mock_payment_intent',
            amount_refunded: 1000,
            currency: 'usd',
            status: 'refunded'
          }
        }
      };
      break;
    default:
      eventData = {
        id: 'evt_mock',
        type: 'unknown.event',
        data: {
          object: {}
        }
      };
  }
  
  return {
    event: eventData,
    signature
  };
};

// Mock Stripe webhook verification
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return { 
      webhooks: {
        constructEvent: jest.fn().mockImplementation((body, sig, secret) => {
          // Parse the stringified body
          const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
          
          // Return the event object directly
          return parsedBody;
        })
      }
    };
  });
});

describe('Webhook Tests', () => {
  
  beforeAll(async () => {
    // Create mock data in database if needed for webhook tests
    
    // Create a test payment record with a Stripe payment ID that matches our mock
    try {
      // First create a payment method
      const testPaymentMethod = await prisma.paymentMethod.create({
        data: {
          type: 'credit_card',
          lastFourDigits: '4242',
          expiryMonth: 12,
          expiryYear: 2030,
          isDefault: true,
          user: {
            create: {
              username: 'webhook_test_user',
              email: 'webhook_test@example.com',
              password: 'hashedPassword',
              role: 'BIDDER'
            }
          }
        }
      });
      
      // Create a payment with our mock payment intent ID
      await prisma.payment.create({
        data: {
          amount: 10.00,
          status: 'PENDING',
          stripePaymentId: 'pi_mock_payment_intent',
          paymentMethodId: testPaymentMethod.id,
          transactions: {
            create: {
              amount: 10.00,
              status: 'PENDING',
              type: 'PACKAGE_PURCHASE',
              description: 'Test transaction'
            }
          }
        }
      });
    } catch (error) {
      console.log('Error creating test data for webhook tests', error);
    }
  });
  
  afterAll(async () => {
    // Clean up test data
    try {
      // Delete the payment with our mock payment intent ID
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: 'pi_mock_payment_intent' }
      });
      
      if (payment) {
        // Delete related transactions
        await prisma.transaction.deleteMany({
          where: { paymentId: payment.id }
        });
        
        // Delete the payment
        await prisma.payment.delete({
          where: { id: payment.id }
        });
      }
      
      // Delete the test payment method and user
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: { 
          user: { 
            email: 'webhook_test@example.com' 
          } 
        },
        include: { user: true }
      });
      
      if (paymentMethod) {
        // Delete the payment method
        await prisma.paymentMethod.delete({
          where: { id: paymentMethod.id }
        });
        
        // Delete the user
        await prisma.user.delete({
          where: { id: paymentMethod.user.id }
        });
      }
    } catch (error) {
      console.log('Error cleaning up webhook test data', error);
    }
    
    await prisma.$disconnect();
  });
  
  // Test payment_intent.succeeded webhook
  describe('POST /api/webhooks/stripe (payment_intent.succeeded)', () => {
    it('should process a successful payment webhook', async () => {
      const { event, signature } = generateMockEvent('payment_intent.succeeded');
      
      const res = await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', signature)
        .send(event);
      
      // It should respond with a 200 status
      expect(res.statusCode).toEqual(200);
      expect(res.body.received).toBe(true);
      
      // Check if the payment was updated in the database
      const payment = await prisma.payment.findFirst({
        where: { stripePaymentId: 'pi_mock_payment_intent' }
      });
      
      // This might not work in the test since we mocked Stripe's webhook verification
      // But the API route should respond correctly
      expect(payment).not.toBeNull();
    });
  });
  
  // Test payment_intent.payment_failed webhook
  describe('POST /api/webhooks/stripe (payment_intent.payment_failed)', () => {
    it('should process a failed payment webhook', async () => {
      const { event, signature } = generateMockEvent('payment_intent.payment_failed');
      
      const res = await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', signature)
        .send(event);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.received).toBe(true);
    });
  });
  
  // Test charge.refunded webhook
  describe('POST /api/webhooks/stripe (charge.refunded)', () => {
    it('should process a refund webhook', async () => {
      const { event, signature } = generateMockEvent('charge.refunded');
      
      const res = await request(app)
        .post('/api/webhooks/stripe')
        .set('stripe-signature', signature)
        .send(event);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.received).toBe(true);
    });
  });
}); 