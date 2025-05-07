import express from 'express'
import { getIO } from '../utils/socketService.js'
import authMiddleware from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.js'
import { prisma } from '../prismaClient.js'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

/**
 * Get the current active user count in an auction room
 */
router.get('/auction/:id/participants', async (req, res) => {
  try {
    const productId = parseInt(req.params.id)
    const io = getIO()
    
    // Get the Socket.IO room for this auction
    const room = io.sockets.adapter.rooms.get(`auction:${productId}`)
    
    // Get the number of participants (or 0 if the room doesn't exist)
    const participantCount = room ? room.size : 0
    
    res.json({
      productId,
      participantCount
    })
  } catch (error) {
    console.error('Error getting participant count:', error)
    res.status(500).json({ error: 'Failed to get participant count' })
  }
})

/**
 * Send a real-time notification to all bidders of a product
 * Only the seller or an admin can use this endpoint
 */
router.post('/notify/auction/:id/bidders', async (req, res) => {
  try {
    const productId = parseInt(req.params.id)
    const { message, title = 'Auction Update' } = req.body
    const userId = req.user.id
    
    // Get the product with seller info
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }
    
    // Check if the user is the seller or an admin
    if (product.sellerId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not authorized to send notifications for this product' })
    }
    
    // Get all bidders for this product
    const bidders = await prisma.bid.findMany({
      where: { productId },
      select: {
        bidderId: true
      },
      distinct: ['bidderId']
    })
    
    const bidderIds = bidders.map(b => b.bidderId)
    
    // Get the Socket.IO instance
    const io = getIO()
    
    // Send notification to each bidder
    bidderIds.forEach(bidderId => {
      io.to(`user:${bidderId}`).emit('notification', {
        type: 'AUCTION_UPDATE',
        productId,
        productName: product.name,
        title,
        message,
        timestamp: new Date()
      })
    })
    
    res.json({
      success: true,
      notifiedCount: bidderIds.length,
      message: `Notification sent to ${bidderIds.length} bidders`
    })
  } catch (error) {
    console.error('Error sending notifications to bidders:', error)
    res.status(500).json({ error: 'Failed to send notifications' })
  }
})

/**
 * Admin only: Broadcast a message to all connected users
 */
router.post('/broadcast', requireRole(['ADMIN']), async (req, res) => {
  try {
    const { message, title = 'System Announcement' } = req.body
    
    // Get the Socket.IO instance
    const io = getIO()
    
    // Broadcast to all connected users
    io.emit('broadcast', {
      type: 'SYSTEM_ANNOUNCEMENT',
      title,
      message,
      timestamp: new Date(),
      fromAdmin: true
    })
    
    res.json({
      success: true,
      message: 'Broadcast sent to all connected users'
    })
  } catch (error) {
    console.error('Error broadcasting message:', error)
    res.status(500).json({ error: 'Failed to broadcast message' })
  }
})

/**
 * Get connected users status (admin only)
 */
router.get('/status', requireRole(['ADMIN']), async (req, res) => {
  try {
    const io = getIO()
    
    // Get all connected sockets
    const sockets = Array.from(io.sockets.sockets.values())
    
    // Count users by role
    const userCounts = {
      total: sockets.length,
      admin: 0,
      seller: 0,
      bidder: 0
    }
    
    sockets.forEach(socket => {
      if (socket.user) {
        const role = socket.user.role.toLowerCase()
        if (userCounts[role] !== undefined) {
          userCounts[role]++
        }
      }
    })
    
    // Get top 5 auctions by participant count
    const auctionRooms = []
    for (const [roomName, room] of io.sockets.adapter.rooms.entries()) {
      if (roomName.startsWith('auction:')) {
        const productId = parseInt(roomName.replace('auction:', ''))
        auctionRooms.push({
          productId,
          participants: room.size
        })
      }
    }
    
    // Sort by participant count and get top 5
    const topAuctions = auctionRooms
      .sort((a, b) => b.participants - a.participants)
      .slice(0, 5)
    
    // Get product names for top auctions
    const auctionDetails = await Promise.all(
      topAuctions.map(async auction => {
        const product = await prisma.product.findUnique({
          where: { id: auction.productId },
          select: { name: true }
        })
        
        return {
          ...auction,
          productName: product ? product.name : 'Unknown'
        }
      })
    )
    
    res.json({
      connectedUsers: userCounts,
      topActiveAuctions: auctionDetails
    })
  } catch (error) {
    console.error('Error getting connection status:', error)
    res.status(500).json({ error: 'Failed to get connection status' })
  }
})

export default router 