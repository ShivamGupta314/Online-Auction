import { prisma } from '../prismaClient.js'
import emailService from '../utils/emailService.js'

/**
 * Send a notification to a specific user
 */
export const sendUserNotification = async (req, res) => {
  const { userId, subject, message } = req.body

  try {
    // Verify admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Send email
    const result = await emailService.sendEmail({
      to: user.email,
      subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a6ee0;">Notification from Online Auction</h2>
        <p>${message}</p>
        <p>Regards,<br>Online Auction Team</p>
      </div>`
    })

    if (result.success) {
      res.json({
        success: true,
        message: `Notification sent to ${user.email}`
      })
    } else {
      throw new Error(result.error)
    }
  } catch (error) {
    console.error('Failed to send user notification:', error)
    res.status(500).json({ error: 'Failed to send notification' })
  }
}

/**
 * Send a broadcast notification to all users with a specific role
 */
export const sendRoleBroadcast = async (req, res) => {
  const { role, subject, message } = req.body

  try {
    // Verify admin role
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' })
    }

    // Validate role
    const validRoles = ['ADMIN', 'SELLER', 'BIDDER']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    // Find users with the specified role
    const users = await prisma.user.findMany({
      where: { role }
    })

    if (users.length === 0) {
      return res.status(404).json({ error: 'No users found with this role' })
    }

    // Send emails (in parallel)
    const emailPromises = users.map(user => 
      emailService.sendEmail({
        to: user.email,
        subject,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a6ee0;">Notification from Online Auction</h2>
          <p>${message}</p>
          <p>Regards,<br>Online Auction Team</p>
        </div>`
      })
    )

    const results = await Promise.allSettled(emailPromises)
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    res.json({
      success: true,
      message: `Sent ${successful} notifications to ${role} users (${failed} failed)`
    })
  } catch (error) {
    console.error('Failed to send role broadcast:', error)
    res.status(500).json({ error: 'Failed to send notifications' })
  }
}

/**
 * Send a notification about a specific product to users who have bid on it
 */
export const notifyProductBidders = async (req, res) => {
  const { productId, subject, message } = req.body

  try {
    // Verify the user is either an admin or the product seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    })

    if (!product) {
      return res.status(404).json({ error: 'Product not found' })
    }

    if (req.user.role !== 'ADMIN' && product.sellerId !== req.user.id) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to notify bidders for this product' })
    }

    // Get unique bidders for this product
    const bids = await prisma.bid.findMany({
      where: { productId },
      include: { bidder: true },
      distinct: ['bidderId']
    })

    if (bids.length === 0) {
      return res.status(404).json({ error: 'No bidders found for this product' })
    }

    // Send emails to all bidders
    const bidders = bids.map(bid => bid.bidder)
    const emailPromises = bidders.map(bidder => 
      emailService.sendEmail({
        to: bidder.email,
        subject,
        text: message,
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a6ee0;">Notification about ${product.name}</h2>
          <p>${message}</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products/${product.id}" style="background-color: #4a6ee0; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">View Product</a></p>
          <p>Regards,<br>Online Auction Team</p>
        </div>`
      })
    )

    const results = await Promise.allSettled(emailPromises)
    
    const successful = results.filter(r => r.status === 'fulfilled' && r.value.success).length
    const failed = results.length - successful

    res.json({
      success: true,
      message: `Sent ${successful} notifications to bidders (${failed} failed)`
    })
  } catch (error) {
    console.error('Failed to notify product bidders:', error)
    res.status(500).json({ error: 'Failed to send notifications' })
  }
}

export default {
  sendUserNotification,
  sendRoleBroadcast,
  notifyProductBidders
} 