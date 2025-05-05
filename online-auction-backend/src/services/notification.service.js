import { prisma } from '../prismaClient.js'
import emailService from '../utils/emailService.js'

/**
 * Send new bid notification to the seller
 */
export const notifySellerOfNewBid = async (bid) => {
  try {
    // Get product with seller information
    const product = await prisma.product.findUnique({
      where: { id: bid.productId },
      include: { 
        seller: true 
      }
    })

    if (!product) {
      console.error(`Product not found for bid ${bid.id}`)
      return { success: false, error: 'Product not found' }
    }

    // Get bidder information
    const bidder = await prisma.user.findUnique({
      where: { id: bid.bidderId }
    })

    if (!bidder) {
      console.error(`Bidder not found for bid ${bid.id}`)
      return { success: false, error: 'Bidder not found' }
    }

    // Create email content
    const template = emailService.templates.newBidTemplate(product, bid, bidder.username)

    // Send email
    const result = await emailService.sendEmail({
      to: product.seller.email,
      subject: template.subject,
      text: template.text,
      html: template.html
    })

    return result
  } catch (error) {
    console.error('Error notifying seller of new bid:', error)
    return { success: false, error }
  }
}

/**
 * Notify previous highest bidder that they've been outbid
 */
export const notifyPreviousBidderOfOutbid = async (bid, previousBidderId) => {
  try {
    // If there was no previous bidder, nothing to do
    if (!previousBidderId) return { success: true, message: 'No previous bidder' }

    // Get product details
    const product = await prisma.product.findUnique({
      where: { id: bid.productId }
    })

    if (!product) {
      console.error(`Product not found for bid ${bid.id}`)
      return { success: false, error: 'Product not found' }
    }

    // Get previous bidder information
    const previousBidder = await prisma.user.findUnique({
      where: { id: previousBidderId }
    })

    if (!previousBidder) {
      console.error(`Previous bidder not found (id: ${previousBidderId})`)
      return { success: false, error: 'Previous bidder not found' }
    }

    // Create email content
    const template = emailService.templates.outbidTemplate(product, bid)

    // Send email
    const result = await emailService.sendEmail({
      to: previousBidder.email,
      subject: template.subject,
      text: template.text,
      html: template.html
    })

    return result
  } catch (error) {
    console.error('Error notifying previous bidder:', error)
    return { success: false, error }
  }
}

/**
 * Notify the winner of an auction
 */
export const notifyAuctionWinner = async (productId) => {
  try {
    // Get product with highest bid
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        bids: {
          orderBy: { price: 'desc' },
          take: 1,
          include: {
            bidder: true
          }
        }
      }
    })

    if (!product) {
      console.error(`Product not found (id: ${productId})`)
      return { success: false, error: 'Product not found' }
    }

    // If no bids, no winner to notify
    if (product.bids.length === 0) {
      return { success: true, message: 'No bids for this product' }
    }

    const winningBid = product.bids[0]
    const winner = winningBid.bidder

    // Create email content
    const template = emailService.templates.auctionWonTemplate(product, winningBid)

    // Send email
    const result = await emailService.sendEmail({
      to: winner.email,
      subject: template.subject,
      text: template.text,
      html: template.html
    })

    return result
  } catch (error) {
    console.error('Error notifying auction winner:', error)
    return { success: false, error }
  }
}

/**
 * Notify the seller that their auction has ended
 */
export const notifySellerOfAuctionEnd = async (productId) => {
  try {
    // Get product with seller and highest bid
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        seller: true,
        bids: {
          orderBy: { price: 'desc' },
          take: 1,
          include: {
            bidder: true
          }
        }
      }
    })

    if (!product) {
      console.error(`Product not found (id: ${productId})`)
      return { success: false, error: 'Product not found' }
    }

    const winningBid = product.bids.length > 0 ? product.bids[0] : null
    const winnerName = winningBid ? winningBid.bidder.username : null

    // Create email content
    const template = emailService.templates.auctionEndedSellerTemplate(
      product, 
      winningBid,
      winnerName
    )

    // Send email
    const result = await emailService.sendEmail({
      to: product.seller.email,
      subject: template.subject,
      text: template.text,
      html: template.html
    })

    return result
  } catch (error) {
    console.error('Error notifying seller of auction end:', error)
    return { success: false, error }
  }
}

export default {
  notifySellerOfNewBid,
  notifyPreviousBidderOfOutbid,
  notifyAuctionWinner,
  notifySellerOfAuctionEnd
} 