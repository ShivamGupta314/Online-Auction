import request from 'supertest'
import app from '../src/app.js'
import {createUserWithRole as createUser, createCategory, createProduct } from './utils/helpers.js'
import {getToken} from './utils/testToken.js'
import {cleanTestDb} from './utils/cleanUpDb.js'
import { prisma } from '../src/prismaClient.js'

let seller, otherSeller, category, product, token, otherToken

beforeAll(async () => {
  try {
    await cleanTestDb()

    // Create resources with unique names
    category = await createCategory('UpdateCat-' + Date.now())
    seller = await createUser('SELLER')
    otherSeller = await createUser('SELLER')

    // Create a test product
    product = await createProduct({ sellerId: seller.id, categoryId: category.id })

    // Generate tokens
    token = getToken(seller)
    otherToken = getToken(otherSeller)
  } catch (error) {
    console.error('Test setup failed:', error);
    throw error;
  }
})

// Clean up after all tests
afterAll(async () => {
  try {
    await cleanTestDb();
    await prisma.$disconnect();
  } catch (error) {
    console.error('Test cleanup failed:', error);
  }
})

describe('PUT /api/products/:id', () => {
  it('should update the product if owned by seller', async () => {
    const res = await request(app)
      .put(`/api/products/${product.id}`)
      .set('Authorization', token)
      .send({ name: 'Updated Name' })

    expect(res.statusCode).toBe(200)
    expect(res.body.name).toBe('Updated Name')
  })

  it('should return 403 if seller does not own the product', async () => {
    const res = await request(app)
      .put(`/api/products/${product.id}`)
      .set('Authorization', otherToken)
      .send({ name: 'Hacked Name' })

    expect(res.statusCode).toBe(403)
    expect(res.body).toHaveProperty('error', 'You cannot edit this product')
  })

  it('should return 400 for invalid input', async () => {
    const res = await request(app)
      .put(`/api/products/${product.id}`)
      .set('Authorization', token)
      .send({ name: '' })

    expect(res.statusCode).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})
