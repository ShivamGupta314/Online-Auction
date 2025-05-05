import request from 'supertest'
import app from '../src/app.js'
import { cleanTestDb } from './utils/cleanUpDb.js'
import { createUserWithRole, createCategory } from './utils/helpers.js'
import { getToken } from './utils/testToken.js'
import { prisma } from '../src/prismaClient.js'

let token, categoryId

beforeAll(async () => {
  await cleanTestDb()
  const seller = await createUserWithRole('SELLER')
  const category = await createCategory('Electronics')
  categoryId = category.id
  token = getToken(seller)
})

afterAll(() => prisma.$disconnect())

describe('POST /api/products', () => {
  it('should create a product with valid data', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({
        name: 'Test Product',
        description: 'This is a valid product.',
        photoUrl: 'https://example.com/photo.jpg',
        minBidPrice: 500,
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        categoryId
      })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.name).toBe('Test Product')
  })

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({ name: '', description: 'bad', minBidPrice: -10 })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})
