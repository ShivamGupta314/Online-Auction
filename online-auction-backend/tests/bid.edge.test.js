import request from 'supertest'
import app from '../src/app.js'
import { cleanTestDb } from './utils/cleanUpDb.js'
import { createUserWithRole, createCategory } from './utils/helpers.js'
import { getToken } from './utils/testToken.js'
import { prisma } from '../src/prismaClient.js'

let seller, bidder, category, sellerToken, bidderToken

beforeAll(async () => {
  await cleanTestDb()
  seller = await createUserWithRole('SELLER')
  bidder = await createUserWithRole('BIDDER')
  category = await createCategory()
  sellerToken = getToken(seller)
  bidderToken = getToken(bidder)
})

afterAll(() => prisma.$disconnect())

describe('Bid Edge Cases', () => {
  it('should reject bid on expired product', async () => {
    const expired = await prisma.product.create({
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
    })

    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', bidderToken)
      .send({ productId: expired.id, price: 120 })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error', 'Auction is not active')
  })

  it('should reject bid on own product', async () => {
    const product = await prisma.product.create({
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
    })

    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', sellerToken)
      .send({ productId: product.id, price: 150 })

    expect(res.statusCode).toBe(403)
    expect(res.body).toHaveProperty('message', 'Forbidden: Insufficient role')
  })
})
