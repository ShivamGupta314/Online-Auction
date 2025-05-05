import request from 'supertest'
import app from '../src/app.js'
import { cleanTestDb } from './utils/cleanUpDb.js'
import { createUserWithRole, createCategory, createProduct } from './utils/helpers.js'
import { getToken } from './utils/testToken.js'
import { prisma } from '../src/prismaClient.js'

let token, seller, bidder, category;

// Setup before all tests
beforeAll(async () => {
  try {
    await cleanTestDb()
    
    seller = await createUserWithRole('SELLER')
    bidder = await createUserWithRole('BIDDER')
    token = getToken(bidder)
    category = await createCategory()
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error; // Re-throw to fail the test
  }
})

// Cleanup after tests
afterAll(async () => {
  try {
    await cleanTestDb();
    await prisma.$disconnect();
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
})

describe('POST /api/bids', () => {
  it('should allow a valid bid from a BIDDER', async () => {
    // Create a unique product for this test
    const product = await createProduct({ 
      sellerId: seller.id, 
      categoryId: category.id 
    });

    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', token)
      .send({ price: 120, productId: product.id })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.price).toBe(120)
  })

  it('should reject bids below current highest', async () => {
    // Create a unique product for this test
    const product = await createProduct({ 
      sellerId: seller.id, 
      categoryId: category.id 
    });

    // Create initial bid
    await prisma.bid.create({
      data: {
        price: 200,
        productId: product.id,
        bidderId: bidder.id,
      },
    })

    // Try to place lower bid
    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', token)
      .send({ price: 150, productId: product.id })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error', 'Bid must be at least 201')
  })

  it('should reject bids on expired product', async () => {
    const expired = await prisma.product.create({
      data: {
        name: 'Expired Product',
        description: 'Expired',
        photoUrl: 'url',
        minBidPrice: 100,
        startTime: new Date(Date.now() - 100000),
        endTime: new Date(Date.now() - 1000),
        sellerId: seller.id,
        categoryId: category.id,
      }
    })

    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', token)
      .send({ price: 150, productId: expired.id })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error', 'Auction is not active')
  })
})
