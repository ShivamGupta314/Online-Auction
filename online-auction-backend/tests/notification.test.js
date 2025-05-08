import { jest } from '@jest/globals'
import notificationService from '../src/services/notification.service.js'
import { prisma } from '../src/prismaClient.js'
import { createUserWithRole } from './utils/helpers.js'
import { cleanTestDb } from './utils/cleanUpDb.js'

// Mock the email service module
jest.mock('../src/utils/emailService.js', () => {
  return {
    default: {
      sendEmail: jest.fn().mockResolvedValue({ success: true, messageId: 'test-id' }),
      templates: {
        newBidTemplate: jest.fn().mockReturnValue({
          subject: 'Test Subject',
          text: 'Test Text',
          html: '<p>Test HTML</p>'
        }),
        outbidTemplate: jest.fn().mockReturnValue({
          subject: 'Test Subject',
          text: 'Test Text',
          html: '<p>Test HTML</p>'
        }),
        auctionWonTemplate: jest.fn().mockReturnValue({
          subject: 'Test Subject',
          text: 'Test Text',
          html: '<p>Test HTML</p>'
        }),
        auctionEndedSellerTemplate: jest.fn().mockReturnValue({
          subject: 'Test Subject',
          text: 'Test Text',
          html: '<p>Test HTML</p>'
        })
      }
    }
  }
})

// Import after mocking
const emailService = (await import('../src/utils/emailService.js')).default

describe('Notification Service', () => {
  let seller, bidder1, bidder2, product, bid

  beforeAll(async () => {
    await cleanTestDb()

    // Create test users
    seller = await createUserWithRole('SELLER')
    bidder1 = await createUserWithRole('BIDDER')
    bidder2 = await createUserWithRole('BIDDER')

    // Create a category
    const category = await prisma.category.create({
      data: {
        name: 'Test Category'
      }
    })

    // Create a test product
    product = await prisma.product.create({
      data: {
        name: 'Test Product',
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
    bid = await prisma.bid.create({
      data: {
        price: 150,
        productId: product.id,
        bidderId: bidder1.id
      }
    })
  })

  afterAll(async () => {
    await cleanTestDb()
    await prisma.$disconnect()
  })

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  test('notifySellerOfNewBid should send email to seller', async () => {
    const result = await notificationService.notifySellerOfNewBid(bid)

    expect(result.success).toBe(true)
    expect(emailService.default.sendEmail).toHaveBeenCalled()
  })

  test('notifyPreviousBidderOfOutbid should send email to previous bidder', async () => {
    // Create a higher bid by bidder2
    const higherBid = await prisma.bid.create({
      data: {
        price: 200,
        productId: product.id,
        bidderId: bidder2.id
      }
    })

    const result = await notificationService.notifyPreviousBidderOfOutbid(higherBid, bidder1.id)

    expect(result.success).toBe(true)
    expect(emailService.default.sendEmail).toHaveBeenCalled()
  })

  test('notifyAuctionWinner should send email to winner', async () => {
    const result = await notificationService.notifyAuctionWinner(product.id)

    expect(result.success).toBe(true)
    expect(emailService.default.sendEmail).toHaveBeenCalled()
  })

  test('notifySellerOfAuctionEnd should send email to seller', async () => {
    const result = await notificationService.notifySellerOfAuctionEnd(product.id)

    expect(result.success).toBe(true)
    expect(emailService.templates.auctionEndedSellerTemplate).toHaveBeenCalled()
    expect(emailService.sendEmail).toHaveBeenCalledWith(expect.objectContaining({
      to: seller.email
    }))
  })
}) 