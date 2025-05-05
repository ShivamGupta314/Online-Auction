import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create a test account for development if no SMTP settings are provided
let transporter

// Initialize the email transporter
const initializeTransporter = async () => {
  // If in development and no SMTP settings are provided, use Ethereal test account
  if (process.env.NODE_ENV !== 'production' && (!process.env.SMTP_HOST || !process.env.SMTP_USER)) {
    console.log('Creating test email account...')
    const testAccount = await nodemailer.createTestAccount()
    
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    })
    
    console.log('Test email account created:', testAccount.user)
  } else {
    // Use configured SMTP settings
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  }
}

// Send an email
const sendEmail = async (options) => {
  if (!transporter) {
    await initializeTransporter()
  }

  const { to, subject, text, html } = options

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Online Auction" <noreply@example.com>',
      to,
      subject,
      text,
      html
    })

    if (process.env.NODE_ENV !== 'production') {
      // Log the preview URL for development testing
      console.log('Email preview URL:', nodemailer.getTestMessageUrl(info))
    }

    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// Email template for new bid notification
const newBidTemplate = (product, bid, bidderName) => {
  return {
    subject: `New Bid on Your Product: ${product.name}`,
    text: `Hello,\n\nA new bid of $${bid.price} has been placed on your product "${product.name}" by ${bidderName}.\n\nCheck your dashboard for more details.\n\nRegards,\nOnline Auction Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4a6ee0;">New Bid Notification</h2>
        <p>Hello,</p>
        <p>A new bid of <strong style="color: #2b9348;">$${bid.price}</strong> has been placed on your product "${product.name}" by ${bidderName}.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Product Details:</h3>
          <p><strong>Name:</strong> ${product.name}</p>
          <p><strong>Current Highest Bid:</strong> $${bid.price}</p>
        </div>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/seller/dashboard" style="background-color: #4a6ee0; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">View in Dashboard</a></p>
        <p>Thank you for using our platform!</p>
        <p>Regards,<br>Online Auction Team</p>
      </div>
    `
  }
}

// Email template for outbid notification
const outbidTemplate = (product, newBid) => {
  return {
    subject: `You've Been Outbid on ${product.name}`,
    text: `Hello,\n\nYou have been outbid on "${product.name}". The new highest bid is $${newBid.price}.\n\nPlace a higher bid to get back in the game!\n\nRegards,\nOnline Auction Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e94a3f;">You've Been Outbid!</h2>
        <p>Hello,</p>
        <p>Someone has placed a higher bid on <strong>${product.name}</strong>.</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Auction Details:</h3>
          <p><strong>Product:</strong> ${product.name}</p>
          <p><strong>New Highest Bid:</strong> $${newBid.price}</p>
          <p><strong>Auction Ends:</strong> ${new Date(product.endTime).toLocaleString()}</p>
        </div>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/products/${product.id}" style="background-color: #e94a3f; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Place a New Bid</a></p>
        <p>Don't miss out on this opportunity!</p>
        <p>Regards,<br>Online Auction Team</p>
      </div>
    `
  }
}

// Email template for auction won notification
const auctionWonTemplate = (product, winningBid) => {
  return {
    subject: `Congratulations! You Won the Auction for ${product.name}`,
    text: `Hello,\n\nCongratulations! You have won the auction for "${product.name}" with your bid of $${winningBid.price}.\n\nPlease complete the payment process to claim your item.\n\nRegards,\nOnline Auction Team`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2b9348;">Congratulations! You've Won!</h2>
        <p>Hello,</p>
        <p>We're excited to inform you that you've won the auction for <strong>${product.name}</strong> with your bid of <strong>$${winningBid.price}</strong>!</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Auction Details:</h3>
          <p><strong>Product:</strong> ${product.name}</p>
          <p><strong>Your Winning Bid:</strong> $${winningBid.price}</p>
        </div>
        <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/${product.id}" style="background-color: #2b9348; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Complete Payment</a></p>
        <p>Thank you for participating in our auction!</p>
        <p>Regards,<br>Online Auction Team</p>
      </div>
    `
  }
}

// Email template for auction ended notification (seller)
const auctionEndedSellerTemplate = (product, winningBid, winnerName) => {
  return {
    subject: `Your Auction for ${product.name} Has Ended`,
    text: winningBid 
      ? `Hello,\n\nYour auction for "${product.name}" has ended. The winning bid was $${winningBid.price} by ${winnerName}.\n\nCheck your dashboard for details on the next steps.\n\nRegards,\nOnline Auction Team`
      : `Hello,\n\nYour auction for "${product.name}" has ended without any bids. You may want to relist it with a different starting price.\n\nRegards,\nOnline Auction Team`,
    html: winningBid
      ? `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a6ee0;">Your Auction Has Ended</h2>
          <p>Hello,</p>
          <p>Your auction for <strong>${product.name}</strong> has ended successfully!</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Auction Results:</h3>
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Winning Bid:</strong> $${winningBid.price}</p>
            <p><strong>Winner:</strong> ${winnerName}</p>
          </div>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/seller/dashboard" style="background-color: #4a6ee0; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">View in Dashboard</a></p>
          <p>Thank you for using our platform!</p>
          <p>Regards,<br>Online Auction Team</p>
        </div>
      `
      : `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4a6ee0;">Your Auction Has Ended</h2>
          <p>Hello,</p>
          <p>Your auction for <strong>${product.name}</strong> has ended without receiving any bids.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Auction Details:</h3>
            <p><strong>Product:</strong> ${product.name}</p>
            <p><strong>Starting Price:</strong> $${product.minBidPrice}</p>
          </div>
          <p>You may want to consider relisting your item with a different starting price or description.</p>
          <p><a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/seller/relist/${product.id}" style="background-color: #4a6ee0; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px; display: inline-block;">Relist Item</a></p>
          <p>Thank you for using our platform!</p>
          <p>Regards,<br>Online Auction Team</p>
        </div>
      `
  }
}

export default {
  sendEmail,
  initializeTransporter,
  templates: {
    newBidTemplate,
    outbidTemplate,
    auctionWonTemplate,
    auctionEndedSellerTemplate
  }
} 