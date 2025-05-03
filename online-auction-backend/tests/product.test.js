import request from 'supertest'
import app from '../src/app.js'
import { prisma } from '../src/prismaClient.js'
import jwt from 'jsonwebtoken'

let token
let productId

const createTestToken = (user) =>
  jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1d' })

const sellerUser = {
  email: 'seller-update@test.com',
  username: 'seller_updater',
  password: 'test123',
  role: 'SELLER'
}

beforeAll(async () => {
  await prisma.userPackage.deleteMany()
  await prisma.bid.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()

  const user = await prisma.user.create({ data: sellerUser })

  token = `Bearer ${createTestToken({
    id: user.id,
    email: user.email,
    role: user.role
  })}`

  const category = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' }
  })

  const product = await prisma.product.create({
    data: {
      name: 'Original Product',
      description: 'This is the original description.',
      photoUrl: 'https://example.com/photo.jpg',
      minBidPrice: 100,
      startTime: new Date(Date.now() + 3600000),
      endTime: new Date(Date.now() + 86400000),
      categoryId: category.id,
      sellerId: user.id
    }
  })

  productId = product.id
})

afterAll(async () => {
  await prisma.userPackage.deleteMany()
  await prisma.bid.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  await prisma.$disconnect()
})

describe('PUT /api/products/:id', () => {
  it('should update the product if owned by seller', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', token)
      .send({
        name: 'Updated Product',
        minBidPrice: 200
      })

    expect(res.statusCode).toBe(200)
    expect(res.body.name).toBe('Updated Product')
    expect(res.body.minBidPrice).toBe(200)
  })

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', token)
      .send({
        minBidPrice: -10 // invalid
      })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })

  it('should return 403 if seller does not own the product', async () => {
    const anotherSeller = await prisma.user.create({
      data: {
        email: 'other@test.com',
        username: 'other',
        password: 'test',
        role: 'SELLER'
      }
    })

    const badToken = `Bearer ${createTestToken({
      id: anotherSeller.id,
      email: anotherSeller.email,
      role: anotherSeller.role
    })}`

    const res = await request(app)
      .put(`/api/products/${productId}`)
      .set('Authorization', badToken)
      .send({ name: 'Hack Attempt' })

    expect(res.statusCode).toBe(403)
    expect(res.body).toHaveProperty('error')
  })
})
