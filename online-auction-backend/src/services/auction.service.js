import { prisma } from '../prismaClient.js'
import notificationService from './notification.service.js'
import socketService from '../utils/socketService.js'

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
      const winningBid = auction.bids.length > 0 ? auction.bids[0] : null;
      
      // Emit real-time auction ended event
      socketService.emitAuctionEnded(auction.id, winningBid);
      
      // Notify the auction winner if there are bids
      if (winningBid) {
        await notificationService.notifyAuctionWinner(auction.id);
        
        // Send real-time notification to winner
        socketService.sendUserNotification(
          winningBid.bidder.id,
          'AUCTION_WON',
          {
            message: `Congratulations! You won the auction for ${auction.name} with a bid of $${winningBid.price}`,
            productId: auction.id,
            productName: auction.name,
            bidAmount: winningBid.price
          }
        );
      }

      // Notify the seller about the auction end
      await notificationService.notifySellerOfAuctionEnd(auction.id);
      
      // Send real-time notification to seller
      socketService.sendUserNotification(
        auction.seller.id,
        'AUCTION_ENDED',
        {
          message: `Your auction for ${auction.name} has ended${winningBid ? ` with a winning bid of $${winningBid.price}` : ' with no bids'}`,
          productId: auction.id,
          productName: auction.name,
          hasBids: !!winningBid,
          winningBid: winningBid ? {
            amount: winningBid.price,
            bidderUsername: winningBid.bidder.username
          } : null
        }
      );

      // Update the product as processed
      await prisma.product.update({
        where: { id: auction.id },
        data: { processed: true }
      });
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

/**
 * Get time remaining for an auction and emit timer updates
 * @param {number} productId - Product ID 
 */
export const emitAuctionTimerUpdates = async (productId) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      console.error(`Product not found: ${productId}`);
      return;
    }
    
    const now = new Date();
    const endTime = new Date(product.endTime);
    
    if (endTime <= now) {
      // Auction already ended
      socketService.emitAuctionTimer(productId, 0);
      return;
    }
    
    // Calculate time remaining in seconds
    const timeRemaining = Math.floor((endTime - now) / 1000);
    
    // Emit timer update
    socketService.emitAuctionTimer(productId, timeRemaining);
    
    return timeRemaining;
  } catch (error) {
    console.error(`Error emitting auction timer for product ${productId}:`, error);
    throw error;
  }
}

export default {
  processEndedAuctions,
  getEndingSoonAuctions,
  emitAuctionTimerUpdates
} 