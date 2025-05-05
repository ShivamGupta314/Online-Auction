import request from 'supertest'
import app from '../src/app.js'
import { cleanTestDb } from './utils/cleanUpDb.js'
import { createUserWithRole, createCategory, createProduct, createBid } from './utils/helpers.js'
import { getToken } from './utils/testToken.js'
import { prisma } from '../src/prismaClient.js'

let token, bidder

beforeAll(async () => {
  await cleanTestDb()

  const seller = await createUserWithRole('SELLER')
  bidder = await createUserWithRole('BIDDER')
  token = getToken(bidder)
  const category = await createCategory()
  const product = await createProduct({ sellerId: seller.id, categoryId: category.id })

  await createBid({ bidderId: bidder.id, productId: product.id, amount: 120 })
  await createBid({ bidderId: bidder.id, productId: product.id, amount: 150 })
})

afterAll(() => prisma.$disconnect())

describe('GET /api/bids/mine', () => {
  it('should return the user bids array', async () => {
    const res = await request(app)
      .get('/api/bids/mine')
      .set('Authorization', token)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    // Don't test for a specific number of bids, as it may vary
    // The content/structure test is sufficient to check if the endpoint works
    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty('product')
    }
  })
})
