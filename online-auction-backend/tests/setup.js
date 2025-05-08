import { jest } from '@jest/globals';
import * as socketService from '../src/utils/socketService.js';
import * as stripeService from '../src/utils/stripeService.js';
import * as emailService from '../src/utils/emailService.js';
import { EventEmitter } from 'events';

// Set test environment
process.env.NODE_ENV = 'test';
process.env.USE_TEST_MOCKS = 'true';
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.DATABASE_URL = 'postgresql://postgres:password@localhost:5432/auctiondb_test';

// Mock PrismaClient
jest.mock('@prisma/client', () => {
  // Mock data structures
  const users = [];
  const products = [];
  const bids = [];
  const categories = [];
  const payments = [];
  const paymentMethods = [];
  
  // Create a mock implementation
  const mockPrismaClient = function() {
    return {
      user: {
        create: jest.fn().mockImplementation(data => {
          const user = { id: users.length + 1, ...data.data };
          users.push(user);
          return Promise.resolve(user);
        }),
        findUnique: jest.fn().mockImplementation(where => {
          const user = users.find(u => u.id === where.where.id);
          return Promise.resolve(user);
        }),
        findMany: jest.fn().mockImplementation(() => Promise.resolve(users)),
        update: jest.fn().mockImplementation(data => {
          const index = users.findIndex(u => u.id === data.where.id);
          if (index >= 0) {
            users[index] = { ...users[index], ...data.data };
            return Promise.resolve(users[index]);
          }
          return Promise.resolve(null);
        }),
        delete: jest.fn().mockImplementation(where => {
          const index = users.findIndex(u => u.id === where.where.id);
          if (index >= 0) {
            const user = users[index];
            users.splice(index, 1);
            return Promise.resolve(user);
          }
          return Promise.resolve(null);
        }),
        deleteMany: jest.fn().mockImplementation(() => {
          const count = users.length;
          users.length = 0;
          return Promise.resolve({ count });
        }),
        upsert: jest.fn().mockImplementation(data => {
          const index = users.findIndex(u => u.id === data.where.id);
          if (index >= 0) {
            users[index] = { ...users[index], ...data.update };
            return Promise.resolve(users[index]);
          } else {
            const user = { id: users.length + 1, ...data.create };
            users.push(user);
            return Promise.resolve(user);
          }
        })
      },
      product: {
        create: jest.fn().mockImplementation(data => {
          const product = { id: products.length + 1, ...data.data };
          products.push(product);
          return Promise.resolve(product);
        }),
        findUnique: jest.fn().mockImplementation(where => {
          const product = products.find(p => p.id === where.where.id);
          return Promise.resolve(product);
        }),
        findMany: jest.fn().mockImplementation(() => Promise.resolve(products)),
        findFirst: jest.fn().mockImplementation(() => Promise.resolve(products[0] || null)),
        update: jest.fn().mockImplementation(data => {
          const index = products.findIndex(p => p.id === data.where.id);
          if (index >= 0) {
            products[index] = { ...products[index], ...data.data };
            return Promise.resolve(products[index]);
          }
          return Promise.resolve(null);
        }),
        delete: jest.fn().mockImplementation(where => {
          const index = products.findIndex(p => p.id === where.where.id);
          if (index >= 0) {
            const product = products[index];
            products.splice(index, 1);
            return Promise.resolve(product);
          }
          return Promise.resolve(null);
        }),
        deleteMany: jest.fn().mockImplementation(() => {
          const count = products.length;
          products.length = 0;
          return Promise.resolve({ count });
        })
      },
      bid: {
        create: jest.fn().mockImplementation(data => {
          const bid = { id: bids.length + 1, ...data.data };
          bids.push(bid);
          return Promise.resolve(bid);
        }),
        findMany: jest.fn().mockImplementation(() => Promise.resolve(bids)),
        findFirst: jest.fn().mockImplementation(() => Promise.resolve(bids[0] || null)),
        deleteMany: jest.fn().mockImplementation(() => {
          const count = bids.length;
          bids.length = 0;
          return Promise.resolve({ count });
        })
      },
      category: {
        create: jest.fn().mockImplementation(data => {
          const category = { id: categories.length + 1, ...data.data };
          categories.push(category);
          return Promise.resolve(category);
        }),
        findMany: jest.fn().mockImplementation(() => Promise.resolve(categories)),
        deleteMany: jest.fn().mockImplementation(() => {
          const count = categories.length;
          categories.length = 0;
          return Promise.resolve({ count });
        })
      },
      payment: {
        create: jest.fn().mockImplementation(data => {
          const payment = { id: payments.length + 1, ...data.data };
          payments.push(payment);
          return Promise.resolve(payment);
        }),
        findUnique: jest.fn().mockImplementation(where => {
          const payment = payments.find(p => p.id === where.where.id);
          return Promise.resolve(payment);
        }),
        findMany: jest.fn().mockImplementation(() => Promise.resolve(payments)),
        findFirst: jest.fn().mockImplementation(() => Promise.resolve(payments[0] || null)),
        deleteMany: jest.fn().mockImplementation(() => {
          const count = payments.length;
          payments.length = 0;
          return Promise.resolve({ count });
        })
      },
      paymentMethod: {
        create: jest.fn().mockImplementation(data => {
          const paymentMethod = { id: paymentMethods.length + 1, ...data.data };
          paymentMethods.push(paymentMethod);
          return Promise.resolve(paymentMethod);
        }),
        findUnique: jest.fn().mockImplementation(where => {
          const method = paymentMethods.find(p => p.id === where.where.id);
          return Promise.resolve(method);
        }),
        findMany: jest.fn().mockImplementation(() => Promise.resolve(paymentMethods)),
        update: jest.fn().mockImplementation(data => {
          const index = paymentMethods.findIndex(p => p.id === data.where.id);
          if (index >= 0) {
            paymentMethods[index] = { ...paymentMethods[index], ...data.data };
            return Promise.resolve(paymentMethods[index]);
          }
          return Promise.resolve(null);
        }),
        delete: jest.fn().mockImplementation(where => {
          const index = paymentMethods.findIndex(p => p.id === where.where.id);
          if (index >= 0) {
            const method = paymentMethods[index];
            paymentMethods.splice(index, 1);
            return Promise.resolve(method);
          }
          return Promise.resolve(null);
        }),
        deleteMany: jest.fn().mockImplementation(() => {
          const count = paymentMethods.length;
          paymentMethods.length = 0;
          return Promise.resolve({ count });
        })
      },
      // Add other models as needed
      $disconnect: jest.fn().mockImplementation(() => Promise.resolve())
    };
  };
  
  return { 
    PrismaClient: mockPrismaClient
  };
});

// Mock the prisma client singleton
jest.mock('../src/prismaClient.js', () => {
  const mockPrismaClient = {
    user: {
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: Date.now(),
          ...data,
          createdAt: new Date(),
          _isMock: true
        });
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return Promise.resolve({
          id: where.id || Date.now(),
          username: 'testuser',
          email: 'test@example.com',
          role: 'BIDDER',
          _isMock: true
        });
      }),
      findFirst: jest.fn().mockImplementation(() => {
        return Promise.resolve({
          id: Date.now(),
          username: 'testuser',
          email: 'test@example.com',
          role: 'BIDDER',
          _isMock: true
        });
      }),
      findMany: jest.fn().mockImplementation(() => {
        return Promise.resolve([
          {
            id: Date.now(),
            username: 'testuser1',
            email: 'test1@example.com',
            role: 'BIDDER',
            _isMock: true
          },
          {
            id: Date.now() + 1,
            username: 'testuser2',
            email: 'test2@example.com',
            role: 'SELLER',
            _isMock: true
          }
        ]);
      }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      count: jest.fn().mockResolvedValue(2),
    },
    category: {
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: Date.now(),
          ...data,
          _isMock: true
        });
      }),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        return Promise.resolve({
          id: where.id || Date.now(),
          name: 'Test Category',
          _isMock: true
        });
      }),
      findMany: jest.fn().mockResolvedValue([
        { id: 1, name: 'Category 1', _isMock: true },
        { id: 2, name: 'Category 2', _isMock: true }
      ]),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    product: {
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: Date.now(),
          ...data,
          createdAt: new Date(),
          processed: false,
          paymentReceived: false,
          _isMock: true
        });
      }),
      findUnique: jest.fn().mockImplementation(({ where, include }) => {
        const mockProduct = {
          id: where.id || Date.now(),
          name: 'Test Product',
          description: 'This is a test product',
          photoUrl: 'https://example.com/test.jpg',
          minBidPrice: 100,
          startTime: new Date(Date.now() - 3600000),
          endTime: new Date(Date.now() + 3600000),
          sellerId: 1,
          categoryId: 1,
          processed: false,
          paymentReceived: false,
          createdAt: new Date(),
          _isMock: true
        };

        if (include?.seller) {
          mockProduct.seller = {
            id: 1,
            username: 'testseller',
            email: 'seller@example.com',
            role: 'SELLER',
            _isMock: true
          };
        }

        if (include?.category) {
          mockProduct.category = {
            id: 1,
            name: 'Test Category',
            _isMock: true
          };
        }

        if (include?.bids) {
          mockProduct.bids = [
            {
              id: 1,
              price: 120,
              createdAt: new Date(),
              productId: mockProduct.id,
              bidderId: 2,
              _isMock: true
            }
          ];
        }

        return Promise.resolve(mockProduct);
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'Test Product 1',
          description: 'Product 1 description',
          photoUrl: 'https://example.com/test1.jpg',
          minBidPrice: 100,
          startTime: new Date(Date.now() - 3600000),
          endTime: new Date(Date.now() + 3600000),
          sellerId: 1,
          categoryId: 1,
          processed: false,
          paymentReceived: false,
          createdAt: new Date(),
          _isMock: true
        },
        {
          id: 2,
          name: 'Test Product 2',
          description: 'Product 2 description',
          photoUrl: 'https://example.com/test2.jpg',
          minBidPrice: 200,
          startTime: new Date(Date.now() - 7200000),
          endTime: new Date(Date.now() + 7200000),
          sellerId: 1,
          categoryId: 2,
          processed: false,
          paymentReceived: false,
          createdAt: new Date(),
          _isMock: true
        }
      ]),
      update: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: 1,
          ...data,
          _isMock: true
        });
      }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
      delete: jest.fn().mockResolvedValue({ id: 1, _isMock: true }),
    },
    bid: {
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: Date.now(),
          ...data,
          createdAt: new Date(),
          _isMock: true
        });
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          price: 120,
          createdAt: new Date(),
          productId: 1,
          bidderId: 2,
          _isMock: true
        },
        {
          id: 2,
          price: 130,
          createdAt: new Date(),
          productId: 1,
          bidderId: 3,
          _isMock: true
        }
      ]),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    payment: {
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: Date.now(),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          _isMock: true
        });
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        amount: 100,
        currency: 'USD',
        status: 'PENDING',
        paymentMethodId: 1,
        stripePaymentId: 'pi_mock123',
        createdAt: new Date(),
        updatedAt: new Date(),
        _isMock: true
      }),
      update: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: 1,
          ...data,
          updatedAt: new Date(),
          _isMock: true
        });
      }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    paymentMethod: {
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: Date.now(),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          _isMock: true
        });
      }),
      findFirst: jest.fn().mockResolvedValue({
        id: 1,
        type: 'credit_card',
        userId: 1,
        stripeCustomerId: 'cus_mock123',
        lastFourDigits: '4242',
        expiryMonth: 12,
        expiryYear: 2030,
        isDefault: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _isMock: true
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          type: 'credit_card',
          userId: 1,
          stripeCustomerId: 'cus_mock123',
          lastFourDigits: '4242',
          expiryMonth: 12,
          expiryYear: 2030,
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _isMock: true
        }
      ]),
      update: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: 1,
          ...data,
          updatedAt: new Date(),
          _isMock: true
        });
      }),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    package: {
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: Date.now(),
          ...data,
          createdAt: new Date(),
          _isMock: true
        });
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Standard Package',
        description: 'Standard selling package',
        price: 99.99,
        duration: 30,
        listingLimit: 10,
        features: ['Feature 1', 'Feature 2'],
        isActive: true,
        createdAt: new Date(),
        _isMock: true
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          name: 'Standard Package',
          description: 'Standard selling package',
          price: 99.99,
          duration: 30,
          listingLimit: 10,
          features: ['Feature 1', 'Feature 2'],
          isActive: true,
          createdAt: new Date(),
          _isMock: true
        },
        {
          id: 2,
          name: 'Premium Package',
          description: 'Premium selling package',
          price: 199.99,
          duration: 60,
          listingLimit: 30,
          features: ['Feature 1', 'Feature 2', 'Feature 3'],
          isActive: true,
          createdAt: new Date(),
          _isMock: true
        }
      ]),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    userPackage: {
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: Date.now(),
          ...data,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30*86400000),
          isActive: true,
          listingsUsed: 0,
          _isMock: true
        });
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          userId: 1,
          packageId: 1,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30*86400000),
          isActive: true,
          transactionId: 'txn_mock123',
          listingsUsed: 5,
          paymentId: 1,
          _isMock: true
        }
      ]),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    transaction: {
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: Date.now(),
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
          _isMock: true
        });
      }),
      findMany: jest.fn().mockResolvedValue([
        {
          id: 1,
          paymentId: 1,
          amount: 99.99,
          currency: 'USD',
          status: 'COMPLETED',
          type: 'PACKAGE_PURCHASE',
          description: 'Purchase of Standard Package',
          reference: 'pi_mock123',
          createdAt: new Date(),
          updatedAt: new Date(),
          _isMock: true
        }
      ]),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    auctionPayment: {
      create: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: Date.now(),
          ...data,
          status: 'PENDING',
          escrowHeld: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          _isMock: true
        });
      }),
      findUnique: jest.fn().mockResolvedValue({
        id: 1,
        paymentId: 1,
        productId: 1,
        buyerId: 2,
        sellerId: 1,
        bidId: 1,
        status: 'PENDING',
        escrowHeld: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        _isMock: true
      }),
      update: jest.fn().mockImplementation(({ data }) => {
        return Promise.resolve({
          id: 1,
          ...data,
          updatedAt: new Date(),
          _isMock: true
        });
      }),
      deleteMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    $transaction: jest.fn().mockImplementation(callback => {
      return Promise.resolve(callback(mockPrismaClient));
    })
  };

  return { prisma: mockPrismaClient };
});

// Mock Socket.IO
const mockIO = {
  to: jest.fn().mockReturnThis(),
  emit: jest.fn(),
  sockets: {
    sockets: new Map()
  }
};

// Mock the Socket.IO service
jest.mock('../src/utils/socketService.js', () => ({
  initializeSocketIO: jest.fn(),
  getIO: jest.fn().mockReturnValue(mockIO),
  emitNewBid: jest.fn(),
  emitAuctionTimer: jest.fn(),
  emitAuctionEnded: jest.fn(),
  sendUserNotification: jest.fn(),
  broadcastToRole: jest.fn(),
  __esModule: true,
  default: {
    initializeSocketIO: jest.fn(),
    getIO: jest.fn().mockReturnValue(mockIO),
    emitNewBid: jest.fn(),
    emitAuctionTimer: jest.fn(),
    emitAuctionEnded: jest.fn(),
    sendUserNotification: jest.fn(),
    broadcastToRole: jest.fn()
  }
}));

// Mock Stripe service
jest.mock('../src/utils/stripeService.js', () => {
  const mockCardDetails = {
    last4: '4242',
    exp_month: 12,
    exp_year: 2030,
  };
  
  return {
    createCustomer: jest.fn().mockResolvedValue({ id: 'cus_mock123' }),
    createPaymentMethod: jest.fn().mockResolvedValue({ 
      id: 'pm_mock123',
      type: 'card',
      card: mockCardDetails
    }),
    processPayment: jest.fn().mockResolvedValue({ 
      id: 'pi_mock123', 
      status: 'succeeded',
      amount: 1000,
      currency: 'usd'
    }),
    createPaymentIntent: jest.fn().mockResolvedValue({ 
      id: 'pi_mock123', 
      client_secret: 'secret_123',
      status: 'requires_payment_method',
      amount: 1000,
      currency: 'usd'
    }),
    retrievePaymentIntent: jest.fn().mockResolvedValue({
      id: 'pi_mock123',
      status: 'succeeded',
      amount: 1000,
      currency: 'usd'
    }),
    createRefund: jest.fn().mockResolvedValue({
      id: 're_mock123',
      status: 'succeeded',
      amount: 1000
    }),
    __esModule: true,
    default: {
      createCustomer: jest.fn().mockResolvedValue({ id: 'cus_mock123' }),
      createPaymentMethod: jest.fn().mockResolvedValue({ 
        id: 'pm_mock123',
        type: 'card',
        card: mockCardDetails
      }),
      processPayment: jest.fn().mockResolvedValue({ 
        id: 'pi_mock123', 
        status: 'succeeded',
        amount: 1000,
        currency: 'usd'
      }),
      createPaymentIntent: jest.fn().mockResolvedValue({ 
        id: 'pi_mock123', 
        client_secret: 'secret_123',
        status: 'requires_payment_method',
        amount: 1000,
        currency: 'usd'
      }),
      retrievePaymentIntent: jest.fn().mockResolvedValue({
        id: 'pi_mock123',
        status: 'succeeded',
        amount: 1000,
        currency: 'usd'
      }),
      createRefund: jest.fn().mockResolvedValue({
        id: 're_mock123',
        status: 'succeeded',
        amount: 1000
      })
    }
  };
});

// Mock email service
jest.mock('../src/utils/emailService.js', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'mock123' }),
  initializeTransporter: jest.fn().mockResolvedValue(true),
  templates: {
    newBidTemplate: jest.fn().mockReturnValue({
      subject: 'New Bid on Your Product',
      text: 'A new bid has been placed',
      html: '<p>A new bid has been placed</p>'
    }),
    outbidTemplate: jest.fn().mockReturnValue({
      subject: 'You have been outbid',
      text: 'Someone has placed a higher bid',
      html: '<p>Someone has placed a higher bid</p>'
    }),
    auctionWonTemplate: jest.fn().mockReturnValue({
      subject: 'You won the auction',
      text: 'Congratulations, you won!',
      html: '<p>Congratulations, you won!</p>'
    }),
    auctionEndedSellerTemplate: jest.fn().mockReturnValue({
      subject: 'Your auction has ended',
      text: 'Your auction has ended',
      html: '<p>Your auction has ended</p>'
    })
  },
  __esModule: true,
  default: {
    sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'mock123' }),
    initializeTransporter: jest.fn().mockResolvedValue(true),
    templates: {
      newBidTemplate: jest.fn().mockReturnValue({
        subject: 'New Bid on Your Product',
        text: 'A new bid has been placed',
        html: '<p>A new bid has been placed</p>'
      }),
      outbidTemplate: jest.fn().mockReturnValue({
        subject: 'You have been outbid',
        text: 'Someone has placed a higher bid',
        html: '<p>Someone has placed a higher bid</p>'
      }),
      auctionWonTemplate: jest.fn().mockReturnValue({
        subject: 'You won the auction',
        text: 'Congratulations, you won!',
        html: '<p>Congratulations, you won!</p>'
      }),
      auctionEndedSellerTemplate: jest.fn().mockReturnValue({
        subject: 'Your auction has ended',
        text: 'Your auction has ended',
        html: '<p>Your auction has ended</p>'
      })
    }
  }
}));

// Increase EventEmitter max listeners to avoid warnings
EventEmitter.defaultMaxListeners = 50;

// Mock nodemailer for tests that import it directly
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test_message_id'
    })
  }),
  createTestAccount: jest.fn().mockResolvedValue({
    user: 'test@ethereal.email',
    pass: 'testpass'
  }),
  getTestMessageUrl: jest.fn().mockReturnValue('https://ethereal.email/test-url')
}));

// Mock Node Mailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({
      messageId: 'test-message-id',
      response: '250 Message sent'
    }),
    verify: jest.fn().mockResolvedValue(true)
  }),
  getTestMessageUrl: jest.fn().mockReturnValue('https://ethereal.email/message/test123')
}));

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn().mockResolvedValue({ id: 'cus_mock123' })
    },
    paymentMethods: {
      create: jest.fn().mockResolvedValue({
        id: 'pm_mock123',
        type: 'card',
        card: {
          last4: '4242',
          exp_month: 12,
          exp_year: 2030
        }
      }),
      attach: jest.fn().mockResolvedValue({
        id: 'pm_mock123',
        customer: 'cus_mock123'
      })
    },
    paymentIntents: {
      create: jest.fn().mockResolvedValue({
        id: 'pi_mock123',
        amount: 10000,
        currency: 'usd',
        status: 'succeeded',
        client_secret: 'pi_mock123_secret_123'
      }),
      retrieve: jest.fn().mockResolvedValue({
        id: 'pi_mock123',
        status: 'succeeded'
      })
    },
    refunds: {
      create: jest.fn().mockResolvedValue({
        id: 're_mock123',
        payment_intent: 'pi_mock123',
        amount: 10000,
        status: 'succeeded'
      })
    },
    transfers: {
      create: jest.fn().mockResolvedValue({
        id: 'tr_mock123',
        amount: 9000,
        currency: 'usd',
        destination: 'acct_mock123'
      })
    },
    webhooks: {
      constructEvent: jest.fn().mockImplementation((body, signature, secret) => {
        return JSON.parse(body);
      })
    }
  }));
}); 