import { prisma } from '../prismaClient.js'
import notificationService from './notification.service.js'

/**
 * Process auctions that have recently ended
 */
export const processEndedAuctions = async () => {
  try {
    console.log('Processing ended auctions...')
    const now = new Date()

    // Get auctions that have ended but not been processed
    // We search for auctions that ended within the last hour
    // to avoid processing very old auctions and to handle cases
    // where the scheduler might have been down
    const endedAuctions = await prisma.product.findMany({
      where: {
        endTime: {
          lt: now,
          gt: new Date(now.getTime() - 3600000) // 1 hour ago
        },
        processed: false // Optional: Add this field to the Product model
      },
      include: {
        bids: {
          orderBy: {
            price: 'desc'
          },
          take: 1,
          include: {
            bidder: true
          }
        },
        seller: true
      }
    })

    console.log(`Found ${endedAuctions.length} ended auctions to process`)

    // Process each ended auction
    for (const auction of endedAuctions) {
      // Notify the auction winner if there are bids
      if (auction.bids.length > 0) {
        await notificationService.notifyAuctionWinner(auction.id)
      }

      // Notify the seller about the auction end
      await notificationService.notifySellerOfAuctionEnd(auction.id)

      // Mark the auction as processed (optional - requires schema update)
      // await prisma.product.update({
      //   where: { id: auction.id },
      //   data: { processed: true }
      // })
    }

    return {
      success: true,
      processed: endedAuctions.length
    }
  } catch (error) {
    console.error('Error processing ended auctions:', error)
    return {
      success: false,
      error
    }
  }
}

/**
 * Get active auctions that are ending soon
 */
export const getEndingSoonAuctions = async (hours = 24) => {
  const now = new Date()
  const cutoff = new Date(now.getTime() + hours * 3600000)

  try {
    return await prisma.product.findMany({
      where: {
        startTime: { lt: now },
        endTime: {
          gt: now,
          lt: cutoff
        }
      },
      include: {
        bids: {
          orderBy: {
            price: 'desc'
          },
          take: 1
        },
        category: true
      }
    })
  } catch (error) {
    console.error('Error fetching ending soon auctions:', error)
    throw error
  }
}

export default {
  processEndedAuctions,
  getEndingSoonAuctions
} 