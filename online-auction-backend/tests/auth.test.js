import request from 'supertest'
import app from '../src/app.js'
import { prisma } from '../src/prismaClient.js'
import bcrypt from 'bcrypt'

// Create a unique user for each test run
const timestamp = Date.now()
const testUser = {
  username: `testuser-${timestamp}`,
  email: `test-${timestamp}@example.com`,
  password: 'test123',
  role: 'BIDDER'
}

beforeAll(async () => {
  // Clean up any potential previous test users
  await prisma.user.deleteMany({ where: { email: testUser.email } })
})

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: testUser.email } })
  await prisma.$disconnect()
})

describe('Auth Tests', () => {
  it('should register successfully', async () => {
    const res = await request(app).post('/api/auth/register').send(testUser)
    expect(res.statusCode).toBe(201)
    expect(res.body).toHaveProperty('token')
  })

  it('should login successfully', async () => {
    // Don't create a new user, just login with the one created in registration test
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('token')
  })
})
