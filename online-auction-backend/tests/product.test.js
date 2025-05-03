import request from 'supertest'
import app from '../src/app.js'
import { prisma } from '../src/prismaClient.js'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

let token

const createTestToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' })

const sellerUser = {
  email: 'seller@test.com',
  username: 'test_seller',
  password: 'test123',
  role: 'SELLER'
}

beforeAll(async () => {
  await prisma.userPackage.deleteMany()
  await prisma.bid.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  const hashedPassword = await bcrypt.hash(sellerUser.password, 10)

  const createdUser = await prisma.user.create({
    data: {
      ...sellerUser,
      password: hashedPassword
    }
  })

  token = `Bearer ${createTestToken({
    id: createdUser.id,
    email: createdUser.email,
    role: createdUser.role
  })}`

  await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' }
  })
})

afterAll(async () => {
  await prisma.userPackage.deleteMany()
  await prisma.bid.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  await prisma.$disconnect()
})

beforeEach(async () => {
  await prisma.bid.deleteMany()
  await prisma.product.deleteMany()
})

describe('POST /api/products', () => {
  it('should create a product with valid data', async () => {
    const category = await prisma.category.findFirst()

    const res = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({
        name: 'Test Product',
        description: 'This is a fully valid product description.',
        photoUrl: 'https://example.com/test.jpg',
        minBidPrice: 500,
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 86400000).toISOString(),
        categoryId: category.id
      })

    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('id')
    expect(res.body.name).toBe('Test Product')
  })

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', token)
      .send({
        name: '',
        description: 'short',
        minBidPrice: -10
      })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})
