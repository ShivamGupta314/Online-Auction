import request from 'supertest'
import app from '../src/app.js'
import { prisma } from '../src/prismaClient.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

let token
let productId

const createTestToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' })

const bidderUser = {
  email: 'bidder@test.com',
  username: 'test_bidder',
  password: 'test123',
  role: 'BIDDER'
}

const sellerUser = {
  email: 'seller@test.com',
  username: 'test_seller',
  password: 'test123',
  role: 'SELLER'
}

beforeAll(async () => {
  await prisma.bid.deleteMany()
  await prisma.product.deleteMany()
  await prisma.userPackage.deleteMany()
  await prisma.user.deleteMany()

  const [hashedBidder, hashedSeller] = await Promise.all([
    bcrypt.hash(bidderUser.password, 10),
    bcrypt.hash(sellerUser.password, 10)
  ])

  const [bidder, seller] = await Promise.all([
    prisma.user.create({ data: { ...bidderUser, password: hashedBidder } }),
    prisma.user.create({ data: { ...sellerUser, password: hashedSeller } })
  ])

  token = `Bearer ${createTestToken({
    id: bidder.id,
    email: bidder.email,
    role: bidder.role
  })}`

  const category = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' }
  })

  const product = await prisma.product.create({
    data: {
      name: 'Auction Item',
      description: 'Biddable item',
      photoUrl: 'https://example.com/item.jpg',
      minBidPrice: 500,
      startTime: new Date(Date.now() - 3600000), // 1hr ago
      endTime: new Date(Date.now() + 3600000),   // 1hr later
      categoryId: category.id,
      sellerId: seller.id
    }
  })

  productId = product.id
})

afterAll(async () => {
  await prisma.bid.deleteMany()
  await prisma.product.deleteMany()
  await prisma.userPackage.deleteMany()
  await prisma.user.deleteMany()
  await prisma.$disconnect()
})

describe('POST /api/bids', () => {
  it('should allow a valid bid from a BIDDER', async () => {
    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', token)
      .send({
        productId,
        price: 550
      })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.productId).toBe(productId)
  })

  it('should reject bids below current highest', async () => {
    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', token)
      .send({
        productId,
        price: 300
      })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('should reject invalid payload', async () => {
    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', token)
      .send({
        productId: 'invalid',
        price: -10
      })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('should reject unauthenticated request', async () => {
    const res = await request(app).post('/api/bids').send({
      productId,
      price: 600
    })

    expect(res.statusCode).toBe(401)
  })

  it('should reject bids on expired product', async () => {
    const category = await prisma.category.findFirst()
    const seller = await prisma.user.findFirst({ where: { role: 'SELLER' } })

    const expiredProduct = await prisma.product.create({
      data: {
        name: 'Expired Item',
        description: 'No longer biddable',
        photoUrl: 'https://example.com/expired.jpg',
        minBidPrice: 500,
        startTime: new Date(Date.now() - 7200000),
        endTime: new Date(Date.now() - 3600000),
        categoryId: category.id,
        sellerId: seller.id
      }
    })


    const res = await request(app)
      .post('/api/bids')
      .set('Authorization', token)
      .send({
        productId: expiredProduct.id,
        price: 600
      })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})
