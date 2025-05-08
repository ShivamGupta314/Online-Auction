import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

// Create a transporter for development if no SMTP settings are provided
let transporter
let testAccount

// Initialize the email transporter
const initializeTransporter = async () => {
  // If already initialized, return
  if (transporter) return;

  // In test environment, just create a dummy transporter
  if (process.env.NODE_ENV === 'test') {
    console.log('[Test] Using mock email transporter');
    transporter = {
      sendMail: (options) => {
        console.log('[Test] Mock email:', options.subject);
        return Promise.resolve({ messageId: 'test_message_id' });
      }
    };
    return;
  }

  // If in development and no SMTP settings are provided, use Ethereal test account
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    try {
      console.log('Creating test account for emails...');
      testAccount = await nodemailer.createTestAccount();
      
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      
      console.log('Test email account created. Check logs for message URLs');
      return;
    } catch (error) {
      console.error('Failed to create test email account:', error);
      
      // Fallback to mock transport if ethereal setup fails
      transporter = {
        sendMail: (options) => {
          console.log('[Fallback] Email would be sent:', options.subject);
          return Promise.resolve({ messageId: 'fallback_mock_id' });
        }
      };
      return;
    }
  }

  // Use configured SMTP settings
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  // Verify connection
  try {
    await transporter.verify();
    console.log('Email service connected and ready');
  } catch (error) {
    console.error('Email service connection failed:', error);
    
    // Fallback to mock transport if connection fails
    transporter = {
      sendMail: (options) => {
        console.log('[Error-Fallback] Email would be sent:', options.subject);
        return Promise.resolve({ messageId: 'error_fallback_mock_id' });
      }
    };
  }
};

// Initialize at startup
initializeTransporter();

/**
 * Send email
 * @param {Object} options - Email options
 * @returns {Promise<Object>} - Email send result
 */
export const sendEmail = async (options) => {
  // Ensure transporter is initialized
  if (!transporter) {
    await initializeTransporter();
  }
  
  const { to, subject, html, text, from } = options;
  
  if (!to || !subject || (!html && !text)) {
    throw new Error('Missing required email options (to, subject, and html/text)');
  }
  
  const mailOptions = {
    from: from || process.env.EMAIL_FROM || 'Online Auction <noreply@onlineauction.com>',
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, '')
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    
    // If using ethereal test account, log email URL
    if (testAccount) {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    
    if (process.env.NODE_ENV !== 'production') {
      // In non-production, don't fail completely
      console.log('Email would have been sent to:', to);
      console.log('Subject:', subject);
      return { 
        messageId: 'error_mock_id',
        error: error.message,
        mockSent: true
      };
    }
    
    throw error;
  }
};

/**
 * Send a welcome email to a new user
 * @param {Object} user - User object
 * @returns {Promise<Object>} Email send result
 */
export const sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to Online Auction</h1>
    <p>Hello ${user.username},</p>
    <p>Thank you for registering with Online Auction. We're excited to have you join our community!</p>
    <p>You can now:</p>
    <ul>
      <li>Browse available auctions</li>
      <li>Place bids on items</li>
      <li>Create your own auctions</li>
    </ul>
    <p>If you have any questions, please don't hesitate to contact us.</p>
    <p>Happy bidding!</p>
    <p>The Online Auction Team</p>
  `;
  
  return await sendEmail({
    to: user.email,
    subject: 'Welcome to Online Auction',
    html
  });
};

/**
 * Send an email notification about a new bid
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>} Email send result
 */
export const sendBidNotification = async (params) => {
  const { product, bid, seller, bidder } = params;
  
  // Email to seller
  const sellerHtml = `
    <h1>New Bid on Your Auction</h1>
    <p>Hello ${seller.username},</p>
    <p>A new bid has been placed on your auction "${product.name}".</p>
    <p>Bid amount: $${bid.price.toFixed(2)}</p>
    <p>Bidder: ${bidder.username}</p>
    <p>This is now the highest bid for this item.</p>
    <p>View your auction <a href="${process.env.FRONTEND_URL}/auctions/${product.id}">here</a>.</p>
    <p>The Online Auction Team</p>
  `;
  
  await sendEmail({
    to: seller.email,
    subject: `New Bid on Your Auction: ${product.name}`,
    html: sellerHtml
  });
  
  // Email to bidder
  const bidderHtml = `
    <h1>Bid Confirmation</h1>
    <p>Hello ${bidder.username},</p>
    <p>Your bid of $${bid.price.toFixed(2)} for "${product.name}" has been successfully placed.</p>
    <p>Your bid is currently the highest for this item.</p>
    <p>Auction ends: ${new Date(product.endTime).toLocaleString()}</p>
    <p>You can view the auction <a href="${process.env.FRONTEND_URL}/auctions/${product.id}">here</a>.</p>
    <p>Good luck!</p>
    <p>The Online Auction Team</p>
  `;
  
  return await sendEmail({
    to: bidder.email,
    subject: `Bid Confirmation: ${product.name}`,
    html: bidderHtml
  });
};

/**
 * Send an outbid notification to a user
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>} Email send result
 */
export const sendOutbidNotification = async (params) => {
  const { product, newBid, previousBidder } = params;
  
  const html = `
    <h1>You've Been Outbid</h1>
    <p>Hello ${previousBidder.username},</p>
    <p>Someone has placed a higher bid on "${product.name}".</p>
    <p>New highest bid: $${newBid.price.toFixed(2)}</p>
    <p>Your previous bid: $${params.previousBidAmount.toFixed(2)}</p>
    <p>The auction ends on ${new Date(product.endTime).toLocaleString()}.</p>
    <p>You can place a new bid <a href="${process.env.FRONTEND_URL}/auctions/${product.id}">here</a>.</p>
    <p>Good luck!</p>
    <p>The Online Auction Team</p>
  `;
  
  return await sendEmail({
    to: previousBidder.email,
    subject: `You've Been Outbid on ${product.name}`,
    html
  });
};

/**
 * Send an auction ended notification to the winner
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>} Email send result
 */
export const sendAuctionWonNotification = async (params) => {
  const { product, winningBid, winner, seller } = params;
  
  const html = `
    <h1>Congratulations! You Won an Auction</h1>
    <p>Hello ${winner.username},</p>
    <p>Congratulations! You've won the auction for "${product.name}" with a bid of $${winningBid.price.toFixed(2)}.</p>
    <p>Next steps:</p>
    <ol>
      <li>Complete payment for your winning bid <a href="${process.env.FRONTEND_URL}/auctions/${product.id}/payment">here</a>.</li>
      <li>The seller (${seller.username}) will be notified once your payment is complete.</li>
      <li>The seller will contact you regarding shipping and delivery details.</li>
    </ol>
    <p>If you have any questions, please contact us.</p>
    <p>Thank you for participating in our auction!</p>
    <p>The Online Auction Team</p>
  `;
  
  return await sendEmail({
    to: winner.email,
    subject: `Congratulations! You Won: ${product.name}`,
    html
  });
};

/**
 * Send an auction ended notification to the seller
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>} Email send result
 */
export const sendAuctionEndedSellerNotification = async (params) => {
  const { product, winningBid, winner, seller } = params;
  
  const html = `
    <h1>Your Auction Has Ended</h1>
    <p>Hello ${seller.username},</p>
    <p>Your auction for "${product.name}" has ended.</p>
    <p>Winning bid: $${winningBid.price.toFixed(2)}</p>
    <p>Winner: ${winner.username}</p>
    <p>Next steps:</p>
    <ol>
      <li>The buyer will complete payment for the winning bid.</li>
      <li>You will receive a notification once payment is complete.</li>
      <li>You should then contact the buyer to arrange shipping and delivery.</li>
    </ol>
    <p>You can view the auction details <a href="${process.env.FRONTEND_URL}/dashboard/sales/${product.id}">here</a>.</p>
    <p>Thank you for using our platform!</p>
    <p>The Online Auction Team</p>
  `;
  
  return await sendEmail({
    to: seller.email,
    subject: `Your Auction Has Ended: ${product.name}`,
    html
  });
};

/**
 * Send a payment confirmation email
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>} Email send result
 */
export const sendPaymentConfirmation = async (params) => {
  const { user, payment, product } = params;
  
  const html = `
    <h1>Payment Confirmation</h1>
    <p>Hello ${user.username},</p>
    <p>Your payment of $${(payment.amount / 100).toFixed(2)} for "${product.name}" has been successfully processed.</p>
    <p>Payment ID: ${payment.id}</p>
    <p>Date: ${new Date().toLocaleString()}</p>
    <p>The seller will be notified and will contact you regarding shipping and delivery details.</p>
    <p>Thank you for your purchase!</p>
    <p>The Online Auction Team</p>
  `;
  
  return await sendEmail({
    to: user.email,
    subject: 'Payment Confirmation',
    html
  });
};

/**
 * Send a payment received notification to the seller
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>} Email send result
 */
export const sendPaymentReceivedNotification = async (params) => {
  const { seller, buyer, payment, product } = params;
  
  const html = `
    <h1>Payment Received</h1>
    <p>Hello ${seller.username},</p>
    <p>The buyer (${buyer.username}) has completed payment for "${product.name}".</p>
    <p>Payment amount: $${(payment.amount / 100).toFixed(2)}</p>
    <p>Payment ID: ${payment.id}</p>
    <p>Date: ${new Date().toLocaleString()}</p>
    <p>Next steps:</p>
    <ol>
      <li>Please contact the buyer to arrange shipping and delivery.</li>
      <li>The funds will be transferred to your account after the buyer confirms receipt.</li>
    </ol>
    <p>You can view the sale details <a href="${process.env.FRONTEND_URL}/dashboard/sales/${product.id}">here</a>.</p>
    <p>Thank you for using our platform!</p>
    <p>The Online Auction Team</p>
  `;
  
  return await sendEmail({
    to: seller.email,
    subject: `Payment Received for ${product.name}`,
    html
  });
};

/**
 * Send a package purchase confirmation email
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>} Email send result
 */
export const sendPackagePurchaseConfirmation = async (params) => {
  const { user, packageInfo, payment } = params;
  
  const html = `
    <h1>Package Purchase Confirmation</h1>
    <p>Hello ${user.username},</p>
    <p>Thank you for purchasing the ${packageInfo.name} package.</p>
    <p>Details:</p>
    <ul>
      <li>Package: ${packageInfo.name}</li>
      <li>Price: $${(payment.amount / 100).toFixed(2)}</li>
      <li>Duration: ${packageInfo.duration} days</li>
      <li>Listings allowed: ${packageInfo.listingLimit}</li>
      <li>Payment ID: ${payment.id}</li>
      <li>Date: ${new Date().toLocaleString()}</li>
    </ul>
    <p>Your package is now active and you can start creating auctions.</p>
    <p>Thank you for your purchase!</p>
    <p>The Online Auction Team</p>
  `;
  
  return await sendEmail({
    to: user.email,
    subject: `Package Purchase Confirmation: ${packageInfo.name}`,
    html
  });
};

/**
 * Send a general notification email
 * @param {Object} params - Email parameters
 * @returns {Promise<Object>} Email send result
 */
export const sendNotification = async (params) => {
  const { user, subject, message } = params;
  
  const html = `
    <h1>${subject}</h1>
    <p>Hello ${user.username},</p>
    <div>${message}</div>
    <p>The Online Auction Team</p>
  `;
  
  return await sendEmail({
    to: user.email,
    subject,
    html
  });
};

// Export default with all functions
export default {
  sendEmail,
  sendWelcomeEmail,
  sendBidNotification,
  sendOutbidNotification,
  sendAuctionWonNotification,
  sendAuctionEndedSellerNotification,
  sendPaymentConfirmation,
  sendPaymentReceivedNotification,
  sendPackagePurchaseConfirmation,
  sendNotification
}; 