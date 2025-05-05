import request from 'supertest'
import app from '../src/app.js'
import { createUserWithRole } from './utils/helpers.js'
import { getToken } from './utils/testToken.js'
import { cleanTestDb } from './utils/cleanUpDb.js'
import { prisma } from '../src/prismaClient.js'

let admin, nonAdmin, adminToken, nonAdminToken

beforeAll(async () => {
  try {
    await cleanTestDb()

    // Create test users
    admin = await createUserWithRole('ADMIN')
    nonAdmin = await createUserWithRole('SELLER')

    // Generate tokens
    adminToken = getToken(admin)
    nonAdminToken = getToken(nonAdmin)
  } catch (error) {
    console.error('Test setup failed:', error)
    throw error
  }
})

afterAll(async () => {
  try {
    await cleanTestDb()
    await prisma.$disconnect()
  } catch (error) {
    console.error('Test cleanup failed:', error)
  }
})

describe('Admin Dashboard API', () => {
  it('should allow admin to access dashboard data', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', adminToken)

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('counts')
    expect(res.body).toHaveProperty('usersByRole')
    expect(res.body).toHaveProperty('products')
    expect(res.body).toHaveProperty('bids')
    expect(res.body).toHaveProperty('topCategories')
  })

  it('should allow admin to get all users', async () => {
    const res = await request(app)
      .get('/api/admin/users')
      .set('Authorization', adminToken)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
    expect(res.body[0]).toHaveProperty('username')
    expect(res.body[0]).toHaveProperty('role')
  })

  it('should allow admin to update a user role', async () => {
    // Create a user to update
    const user = await createUserWithRole('BIDDER')

    const res = await request(app)
      .put(`/api/admin/users/${user.id}/role`)
      .set('Authorization', adminToken)
      .send({ role: 'SELLER' })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('id', user.id)
    expect(res.body).toHaveProperty('role', 'SELLER')

    // Verify in database
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id }
    })
    expect(updatedUser.role).toBe('SELLER')
  })

  it('should allow admin to get problematic products', async () => {
    const res = await request(app)
      .get('/api/admin/products/problematic')
      .set('Authorization', adminToken)

    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
  })

  it('should not allow non-admin to access admin routes', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', nonAdminToken)

    expect(res.statusCode).toBe(403)
    expect(res.body).toHaveProperty('message', 'Forbidden: Insufficient role')
  })
}) 