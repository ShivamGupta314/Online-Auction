import request from 'supertest'
import app from '../src/app.js'
import { prisma } from '../src/prismaClient.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

let token
let bidderId

const createTestToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' })

beforeAll(async () => {
  await prisma.bid.deleteMany()
  await prisma.product.deleteMany()
  await prisma.userPackage.deleteMany()
  await prisma.user.deleteMany()

  const category = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' }
  })

  // Seed seller
  const seller = await prisma.user.create({
    data: {
      email: 'seller@mine.com',
      username: 'seller_mine',
      password: await bcrypt.hash('test123', 10),
      role: 'SELLER'
    }
  })

  // Seed bidder
  const bidder = await prisma.user.create({
    data: {
      email: 'bidder@mine.com',
      username: 'bidder_mine',
      password: await bcrypt.hash('test123', 10),
      role: 'BIDDER'
    }
  })

  bidderId = bidder.id
  token = `Bearer ${createTestToken({ id: bidder.id, email: bidder.email, role: bidder.role })}`

  // Product with multiple bids
  const product = await prisma.product.create({
    data: {
      name: 'Test Biddable Product',
      description: 'Auction item',
      photoUrl: 'https://example.com/item.jpg',
      minBidPrice: 100,
      startTime: new Date(Date.now() - 3600000),
      endTime: new Date(Date.now() + 3600000),
      categoryId: category.id,
      sellerId: seller.id
    }
  })

  // Seed two bids (one by test bidder)
  await prisma.bid.createMany({
    data: [
      {
        price: 120,
        productId: product.id,
        bidderId: bidder.id
      },
      {
        price: 130,
        productId: product.id,
        bidderId: seller.id // seller bids (shouldn’t happen in prod)
      }
    ]
  })
})

afterAll(async () => {
  await prisma.bid.deleteMany()
  await prisma.product.deleteMany()
  await prisma.userPackage.deleteMany()
  await prisma.user.deleteMany()
  await prisma.$disconnect()
})

describe('GET /api/bids/mine', () => {
  it('should return bids made by the logged-in user', async () => {
    const res = await request(app)
      .get('/api/bids/mine')
      .set('Authorization', token)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)

    for (const bid of res.body) {
      expect(bid).toHaveProperty('isWinning')
      expect(bid).toHaveProperty('product')
      expect(bid.bidderId).toBe(bidderId)
    }
  })
})
