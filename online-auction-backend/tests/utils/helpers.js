// tests/utils/helpers.js
import { prisma } from '../../src/prismaClient.js'

export const createUserWithRole = async (role = 'BIDDER') => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  return prisma.user.create({
    data: {
      email: `test-${role}-${timestamp}-${random}@example.com`,
      username: `user-${timestamp}-${random}`,
      password: 'hashed-password', // mock or pre-hashed
      role,
    },
  })
}

export const createCategory = async (name = `Category-${Date.now()}`) =>
  prisma.category.create({ data: { name } })

export const createBid = async ({ bidderId, productId, amount }) =>
  prisma.bid.create({ 
    data: { 
      bidderId, 
      productId, 
      price: amount // Changed from 'amount' to 'price' to match schema
    }
  })

export const createProduct = async ({ sellerId, categoryId }) =>
  prisma.product.create({
    data: {
      name: 'Test Product',
      description: 'Demo description',
      photoUrl: 'https://example.com/default.jpg',
      minBidPrice: 99.99,
      startTime: new Date(Date.now() - 3600000), // 1 hour ago
      endTime: new Date(Date.now() + 3600000), // 1 hour later
      sellerId,
      categoryId,
    },
  })
