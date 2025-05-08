// Already shared, but repeating for clarity
import { prisma } from '../../src/prismaClient.js'

/**
 * Clean up the test database by removing test data
 */
export const cleanTestDb = async () => {
  // Only clean up if we're in test mode
  if (process.env.NODE_ENV === 'test') {
    console.log('🧹 Cleaning up test database...')
    
    // If using mocks, no need to clean real database
    if (process.env.USE_TEST_MOCKS === 'true') {
      console.log('Using test mocks - no database cleanup needed')
      return
    }
    
    try {
      // Delete data in appropriate order to avoid foreign key constraint issues
      await prisma.bid.deleteMany({})
      await prisma.auctionPayment.deleteMany({})
      await prisma.transaction.deleteMany({})
      await prisma.payment.deleteMany({})
      await prisma.paymentMethod.deleteMany({})
      await prisma.userPackage.deleteMany({})
      await prisma.product.deleteMany({})
      await prisma.category.deleteMany({})
      await prisma.user.deleteMany({
        where: {
          email: {
            contains: '@example.com'
          }
        }
      })
      await prisma.package.deleteMany({
        where: {
          name: {
            startsWith: 'Package '
          }
        }
      })
      
      console.log('Database cleaned successfully')
    } catch (error) {
      console.error('Error cleaning test database:', error)
    }
  }
}

export default {
  cleanTestDb
}
  