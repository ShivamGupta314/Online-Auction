import { jest } from '@jest/globals'
import request from 'supertest'
import app from '../src/app.js'
import { prisma } from '../src/prismaClient.js'
import { createUserWithRole } from './utils/helpers.js'
import { getToken } from './utils/testToken.js'
import { cleanTestDb } from './utils/cleanUpDb.js'

// Mock the email service module
jest.mock('../src/utils/emailService.js', () => {
  return {
    default: {
      sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'test-id' }),
      initializeTransporter: jest.fn().mockResolvedValue(true)
    }
  }
})

describe('Manual Notification API', () => {
  let admin, seller, bidder, product, adminToken, sellerToken, bidderToken

  beforeAll(async () => {
    await cleanTestDb()

    // Create test users
    admin = await createUserWithRole('ADMIN')
    seller = await createUserWithRole('SELLER')
    bidder = await createUserWithRole('BIDDER')

    // Create tokens
    adminToken = getToken(admin)
    sellerToken = getToken(seller)
    bidderToken = getToken(bidder)

    // Create a category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category for Notifications'
      }
    })

    // Create a test product
    product = await prisma.product.create({
      data: {
        name: 'Product for Notification Tests',
        description: 'Test Description',
        photoUrl: 'https://example.com/photo.jpg',
        minBidPrice: 100,
        startTime: new Date(Date.now() - 3600000), // 1 hour ago
        endTime: new Date(Date.now() + 3600000), // 1 hour from now
        sellerId: seller.id,
        categoryId: category.id
      }
    })

    // Create a test bid
    await prisma.bid.create({
      data: {
        price: 150,
        productId: product.id,
        bidderId: bidder.id
      }
    })
  })

  afterAll(async () => {
    await cleanTestDb()
    await prisma.$disconnect()
  })

  describe('POST /api/notifications/user', () => {
    test('Admin can send notification to a specific user', async () => {
      const response = await request(app)
        .post('/api/notifications/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: bidder.id,
          subject: 'Test Notification',
          message: 'This is a test notification message for a specific user.'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    test('Non-admin users cannot send notifications', async () => {
      const response = await request(app)
        .post('/api/notifications/user')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          userId: bidder.id,
          subject: 'Test Notification',
          message: 'This is a test notification message.'
        })

      expect(response.status).toBe(403)
    })

    test('Returns 404 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/notifications/user')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userId: 9999, // Non-existent user ID
          subject: 'Test Notification',
          message: 'This is a test notification message.'
        })

      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/notifications/broadcast', () => {
    test('Admin can send broadcast to users by role', async () => {
      const response = await request(app)
        .post('/api/notifications/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'BIDDER',
          subject: 'Broadcast Test',
          message: 'This is a test broadcast message to all bidders.'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    test('Non-admin users cannot send broadcasts', async () => {
      const response = await request(app)
        .post('/api/notifications/broadcast')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          role: 'BIDDER',
          subject: 'Broadcast Test',
          message: 'This is a test broadcast message.'
        })

      expect(response.status).toBe(403)
    })

    test('Validates the role parameter', async () => {
      const response = await request(app)
        .post('/api/notifications/broadcast')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'INVALID_ROLE',
          subject: 'Broadcast Test',
          message: 'This is a test broadcast message.'
        })

      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/notifications/product-bidders', () => {
    test('Seller can notify bidders on their own product', async () => {
      const response = await request(app)
        .post('/api/notifications/product-bidders')
        .set('Authorization', `Bearer ${sellerToken}`)
        .send({
          productId: product.id,
          subject: 'Product Update',
          message: 'This is an update about the product you bid on.'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    test('Admin can notify bidders on any product', async () => {
      const response = await request(app)
        .post('/api/notifications/product-bidders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: product.id,
          subject: 'Product Update from Admin',
          message: 'This is an admin update about the product you bid on.'
        })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })

    test('Sellers cannot notify bidders on another seller\'s product', async () => {
      // Create another seller
      const anotherSeller = await createUserWithRole('SELLER')
      const anotherSellerToken = getToken(anotherSeller)

      const response = await request(app)
        .post('/api/notifications/product-bidders')
        .set('Authorization', `Bearer ${anotherSellerToken}`)
        .send({
          productId: product.id,
          subject: 'Unauthorized Product Update',
          message: 'This is an update about the product you bid on.'
        })

      expect(response.status).toBe(403)
    })

    test('Returns 404 for non-existent product', async () => {
      const response = await request(app)
        .post('/api/notifications/product-bidders')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          productId: 9999, // Non-existent product ID
          subject: 'Product Update',
          message: 'This is an update about the product you bid on.'
        })

      expect(response.status).toBe(404)
    })
  })
}) 