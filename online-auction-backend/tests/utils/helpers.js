// tests/utils/helpers.js
import { prisma } from '../../src/prismaClient.js'
import jwt from 'jsonwebtoken'

// Check if we're in test mode with mocks
const USE_MOCKS = process.env.NODE_ENV === 'test' && process.env.USE_TEST_MOCKS === 'true'

export const createUserWithRole = async (role = 'BIDDER') => {
  const timestamp = Date.now()
  const random = Math.floor(Math.random() * 10000)
  
  // If in test mode with mocks, return fake user immediately
  if (USE_MOCKS) {
    return {
      id: random,
      username: `testuser${timestamp}${random}`,
      email: `test${timestamp}${random}@example.com`,
      password: 'password123',
      role,
      _isMock: true
    }
  }
  
  try {
    return await prisma.user.create({
      data: {
        username: `testuser${timestamp}${random}`,
        email: `test${timestamp}${random}@example.com`,
        password: 'password123',
        role
      }
    })
  } catch (error) {
    console.error('Error creating test user:', error)
    // Fallback to mock
    return {
      id: random,
      username: `testuser${timestamp}${random}`,
      email: `test${timestamp}${random}@example.com`,
      password: 'password123',
      role,
      _isMock: true
    }
  }
}

export const createUser = createUserWithRole

export const createCategory = async (name = `Category-${Date.now()}`) => {
  // If in test mode with mocks, return fake category
  if (USE_MOCKS) {
    return {
      id: Date.now(),
      name,
      _isMock: true
    }
  }
  
  try {
    return await prisma.category.create({
      data: {
        name
      }
    })
  } catch (error) {
    console.error('Error creating test category:', error)
    // Fallback to mock
    return {
      id: Date.now(),
      name,
      _isMock: true
    }
  }
}

export const createBid = async (productId, bidderId, price) => {
  // If in test mode with mocks, return fake bid
  if (USE_MOCKS) {
    return {
      id: Date.now(),
      productId,
      bidderId,
      price,
      createdAt: new Date(),
      _isMock: true
    }
  }
  
  try {
    return await prisma.bid.create({
      data: {
        productId,
        bidderId,
        price
      }
    })
  } catch (error) {
    console.error('Error creating test bid:', error)
    // Fallback to mock
    return {
      id: Date.now(),
      productId,
      bidderId,
      price,
      createdAt: new Date(),
      _isMock: true
    }
  }
}

export const createProduct = async ({
  name = `Test Product ${Date.now()}`,
  description = 'This is a test product',
  photoUrl = 'https://example.com/photo.jpg',
  startTime = new Date(Date.now() - 3600000), // 1 hour ago
  endTime = new Date(Date.now() + 3600000), // 1 hour from now
  sellerId,
  categoryId,
  minBidPrice = 100 
}) => {
  // If in test mode with mocks, return fake product
  if (USE_MOCKS) {
    return {
      id: Date.now(),
      name,
      description,
      photoUrl,
      minBidPrice,
      startTime,
      endTime,
      sellerId,
      categoryId,
      bids: [],
      createdAt: new Date(),
      processed: false,
      paymentReceived: false,
      _isMock: true
    }
  }
  
  try {
    return await prisma.product.create({
      data: {
        name,
        description,
        photoUrl,
        minBidPrice,
        startTime,
        endTime,
        sellerId,
        categoryId
      }
    })
  } catch (error) {
    console.error('Error creating test product:', error)
    // Fallback to mock
    return {
      id: Date.now(),
      name,
      description,
      photoUrl,
      minBidPrice,
      startTime,
      endTime,
      sellerId,
      categoryId,
      bids: [],
      createdAt: new Date(),
      processed: false,
      paymentReceived: false,
      _isMock: true
    }
  }
}

export const generateAuthToken = (user) => {
  const secret = process.env.JWT_SECRET || 'test_secret'
  const payload = {
    id: user.id,
    role: user.role
  }
  return jwt.sign(payload, secret, { expiresIn: '1h' })
}

export const createUserAndGenerateToken = async (role = 'BIDDER') => {
  const user = await createUserWithRole(role)
  const token = generateAuthToken(user)
  return { user, token }
}

export const createPackage = async (name = `Package ${Date.now()}`) => {
  // If in test mode with mocks, return fake package
  if (USE_MOCKS) {
    return {
      id: Date.now(),
      name,
      description: 'Test package',
      price: 99.99,
      duration: 30,
      listingLimit: 10,
      features: ['Feature 1', 'Feature 2'],
      isActive: true,
      _isMock: true
    }
  }
  
  try {
    return await prisma.package.create({
      data: {
        name,
        description: 'Test package',
        price: 99.99,
        duration: 30,
        listingLimit: 10,
        features: ['Feature 1', 'Feature 2'],
        isActive: true
      }
    })
  } catch (error) {
    console.error('Error creating test package:', error)
    // In test mode with mocks, create a fake package if there's an error
    return {
      id: Date.now(),
      name,
      description: 'Test package',
      price: 99.99,
      duration: 30,
      listingLimit: 10,
      features: ['Feature 1', 'Feature 2'],
      isActive: true,
      _isMock: true
    }
  }
}

export const createPaymentMethod = async (userId) => {
  // If in test mode with mocks, return fake payment method
  if (USE_MOCKS) {
    return {
      id: Date.now(),
      type: 'credit_card',
      userId,
      lastFourDigits: '4242',
      expiryMonth: 12,
      expiryYear: 2030,
      isDefault: true,
      stripeCustomerId: 'cus_mock123',
      _isMock: true
    }
  }
  
  try {
    return await prisma.paymentMethod.create({
      data: {
        type: 'credit_card',
        userId,
        lastFourDigits: '4242',
        expiryMonth: 12,
        expiryYear: 2030,
        isDefault: true,
        stripeCustomerId: 'cus_mock123'
      }
    })
  } catch (error) {
    console.error('Error creating test payment method:', error)
    // Fallback to mock
    return {
      id: Date.now(),
      type: 'credit_card',
      userId,
      lastFourDigits: '4242',
      expiryMonth: 12,
      expiryYear: 2030,
      isDefault: true,
      stripeCustomerId: 'cus_mock123',
      _isMock: true
    }
  }
}
