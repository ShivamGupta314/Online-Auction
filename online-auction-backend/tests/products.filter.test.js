import request from 'supertest'
import app from '../src/app.js'
import { prisma } from '../src/prismaClient.js'
import { cleanTestDb } from './utils/cleanUpDb.js'

let category, seller

beforeAll(async () => {
  await cleanTestDb()

  category = await prisma.category.create({
    data: { name: 'Electronics' }
  })

  seller = await prisma.user.create({
    data: {
      username: 'filter_seller',
      email: 'filter@example.com',
      password: 'test123',
      role: 'SELLER',
    },
  })

  const now = new Date()
  const later = new Date(now.getTime() + 1000 * 60 * 60)

  await prisma.product.createMany({
    data: [
      {
        name: 'MacBook Pro',
        description: 'Apple laptop',
        photoUrl: 'url1',
        minBidPrice: 999,
        startTime: now,
        endTime: later,
        sellerId: seller.id,
        categoryId: category.id,
      },
      {
        name: 'iPhone 14',
        description: 'Apple phone',
        photoUrl: 'url2',
        minBidPrice: 899,
        startTime: now,
        endTime: later,
        sellerId: seller.id,
        categoryId: category.id,
      },
      {
        name: 'Dell Monitor',
        description: 'Display device',
        photoUrl: 'url3',
        minBidPrice: 300,
        startTime: now,
        endTime: later,
        sellerId: seller.id,
        categoryId: category.id,
      },
    ],
  })
})

afterAll(() => prisma.$disconnect())

describe('GET /api/products (filters)', () => {
  it('should return products matching search by name', async () => {
    const res = await request(app).get('/api/products?search=macbook')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].name.toLowerCase()).toContain('macbook')
  })

  it('should return products within price range', async () => {
    const res = await request(app).get('/api/products?min=800&max=1000')
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(2)
  })

  it('should return products by category ID', async () => {
    const res = await request(app).get(`/api/products?category=${category.id}`)
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBeGreaterThanOrEqual(3)
  })

  it('should return correct results with all filters applied', async () => {
    const res = await request(app).get(
      `/api/products?search=iphone&min=800&max=1000&category=${category.id}`
    )
    expect(res.statusCode).toBe(200)
    expect(res.body.length).toBe(1)
    expect(res.body[0].name.toLowerCase()).toContain('iphone')
  })
})
