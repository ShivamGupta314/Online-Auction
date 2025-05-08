import request from 'supertest'
import app from '../src/app.js'
import { cleanTestDb } from './utils/cleanUpDb.js'
import { createUserWithRole, createCategory } from './utils/helpers.js'
import { getToken } from './utils/testToken.js'
import { prisma } from '../src/prismaClient.js'

// Check if we're in test mode with mocks
const USE_TEST_MOCKS = process.env.NODE_ENV === 'test' && process.env.USE_TEST_MOCKS === 'true';

let seller, bidder, category, sellerToken, bidderToken

beforeAll(async () => {
  await cleanTestDb()
  seller = await createUserWithRole('SELLER')
  bidder = await createUserWithRole('BIDDER')
  category = await createCategory()
  sellerToken = getToken(seller)
  bidderToken = getToken(bidder)
})

afterAll(async () => {
  // Only disconnect if not using mocks
  if (!USE_TEST_MOCKS && typeof prisma.$disconnect === 'function') {
    await prisma.$disconnect()
  }
})

describe('Bid Edge Cases', () => {
  it('should reject bid on expired product', async () => {
    let expired;
    
    if (USE_TEST_MOCKS) {
      // Create a mock product for test mode
      expired = {
        id: 1001,
        name: 'Expired Product',
        description: 'Cannot bid',
        photoUrl: 'img',
        minBidPrice: 100,
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 3600000),
        sellerId: seller.id,
        categoryId: category.id,
        _isMock: true
      };
    } else {
      // Use real database for non-mock mode
      expired = await prisma.product.create({
        data: {
          name: 'Expired Product',
          description: 'Cannot bid',
          photoUrl: 'img',
          minBidPrice: 100,
          startTime: new Date(Date.now() - 7200000),
          endTime: new Date(Date.now() - 3600000),
          sellerId: seller.id,
          categoryId: category.id
        }
      });
    }

    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', bidderToken)
      .send({ productId: expired.id, price: 120 })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error', 'Auction is not active')
  })

  it('should reject bid on own product', async () => {
    let product;
    
    if (USE_TEST_MOCKS) {
      // Create a mock product for test mode
      product = {
        id: 1002,
        name: 'Own Product',
        description: 'Bidding on own item',
        photoUrl: 'img',
        minBidPrice: 100,
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000),
        sellerId: seller.id,
        categoryId: category.id,
        _isMock: true
      };
    } else {
      // Use real database for non-mock mode
      product = await prisma.product.create({
        data: {
          name: 'Own Product',
          description: 'Bidding on own item',
          photoUrl: 'img',
          minBidPrice: 100,
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000),
          sellerId: seller.id,
          categoryId: category.id
        }
      });
    }

    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', sellerToken)
      .send({ productId: product.id, price: 150 })

    expect(res.statusCode).toBe(403)
    expect(res.body).toHaveProperty('message', 'Forbidden: Insufficient role')
  })
})
