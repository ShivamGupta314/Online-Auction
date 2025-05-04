import request from 'supertest'
import app from '../src/app.js'
import { prisma } from '../src/prismaClient.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

let token
let categoryId

const createTestToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' })

beforeAll(async () => {
  await prisma.bid.deleteMany()
  await prisma.product.deleteMany()
  await prisma.userPackage.deleteMany()
  await prisma.user.deleteMany()

  const seller = await prisma.user.create({
    data: {
      email: 'filterseller@test.com',
      username: 'filterseller',
      password: await bcrypt.hash('filter123', 10),
      role: 'SELLER'
    }
  })

  token = `Bearer ${createTestToken({
    id: seller.id,
    email: seller.email,
    role: seller.role
  })}`

  const category = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' }
  })

  categoryId = category.id

  const baseTime = new Date(Date.now() + 3600000) // 1hr from now
  const laterTime = new Date(Date.now() + 86400000)

  await prisma.product.createMany({
    data: [
      {
        name: 'MacBook Pro',
        description: 'Apple laptop',
        photoUrl: 'https://example.com/mac.jpg',
        minBidPrice: 1500,
        startTime: baseTime,
        endTime: laterTime,
        categoryId,
        sellerId: seller.id
      },
      {
        name: 'iPhone',
        description: 'Apple phone',
        photoUrl: 'https://example.com/iphone.jpg',
        minBidPrice: 900,
        startTime: baseTime,
        endTime: laterTime,
        categoryId,
        sellerId: seller.id
      },
      {
        name: 'Samsung TV',
        description: 'Smart TV',
        photoUrl: 'https://example.com/tv.jpg',
        minBidPrice: 600,
        startTime: baseTime,
        endTime: laterTime,
        categoryId,
        sellerId: seller.id
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

describe('GET /api/products (filters)', () => {
  it('should return products matching search by name', async () => {
    const res = await request(app).get('/api/products?search=macbook')
    expect(res.statusCode).toBe(200)
    expect(res.body.some(p => p.name.toLowerCase().includes('macbook'))).toBe(true)
  })

  it('should return products within price range', async () => {
    const res = await request(app).get('/api/products?min=800&max=1000')
    expect(res.statusCode).toBe(200)
    expect(res.body.every(p => p.minBidPrice >= 800 && p.minBidPrice <= 1000)).toBe(true)
  })

  it('should return products by category ID', async () => {
    const res = await request(app).get(`/api/products?category=${categoryId}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThan(0)
  })

  it('should return correct results with all filters applied', async () => {
    const res = await request(app).get(`/api/products?search=iphone&min=800&max=1000&category=${categoryId}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].name.toLowerCase()).toContain('iphone')
  })
})
