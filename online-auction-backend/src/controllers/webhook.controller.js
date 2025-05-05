import Stripe from 'stripe';
import dotenv from 'dotenv';
import { prisma } from '../prismaClient.js';

dotenv.config();

// Get keys from environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

const stripe = new Stripe(STRIPE_SECRET_KEY);

/**
 * Handle Stripe webhook events
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  
  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      STRIPE_WEBHOOK_SECRET
    );
    
    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;
        
      case 'charge.refunded':
        await handleChargeRefunded(event.data.object);
        break;
        
      // Add other event types as needed
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ success: false, message: 'Webhook signature verification failed' });
  }
};

/**
 * Handle successful payment intent
 * @param {Object} paymentIntent - Stripe payment intent object
 */
const handlePaymentIntentSucceeded = async (paymentIntent) => {
  try {
    // Find payment by Stripe payment ID
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
      include: {
        transactions: true,
        auctionPayment: true
      }
    });
    
    if (!payment) {
      console.log(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }
    
    // Update payment status to COMPLETED
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'COMPLETED' }
    });
    
    // Update all transactions for this payment
    await prisma.transaction.updateMany({
      where: { paymentId: payment.id },
      data: { status: 'COMPLETED' }
    });
    
    // If it's an auction payment, update auction payment status
    if (payment.auctionPayment) {
      await prisma.auctionPayment.update({
        where: { id: payment.auctionPayment.id },
        data: { status: 'PAID' }
      });
      
      // Update product payment status
      await prisma.product.update({
        where: { id: payment.auctionPayment.productId },
        data: { paymentReceived: true }
      });
    }
    
    console.log(`Payment ${payment.id} updated to COMPLETED`);
  } catch (error) {
    console.error('Error handling payment intent succeeded:', error);
  }
};

/**
 * Handle failed payment intent
 * @param {Object} paymentIntent - Stripe payment intent object
 */
const handlePaymentIntentFailed = async (paymentIntent) => {
  try {
    // Find payment by Stripe payment ID
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntent.id },
      include: {
        transactions: true,
        auctionPayment: true
      }
    });
    
    if (!payment) {
      console.log(`Payment not found for payment intent: ${paymentIntent.id}`);
      return;
    }
    
    // Update payment status to FAILED
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'FAILED' }
    });
    
    // Update all transactions for this payment
    await prisma.transaction.updateMany({
      where: { paymentId: payment.id },
      data: { status: 'FAILED' }
    });
    
    // If it's an auction payment, update auction payment status
    if (payment.auctionPayment) {
      await prisma.auctionPayment.update({
        where: { id: payment.auctionPayment.id },
        data: { status: 'CANCELLED' }
      });
    }
    
    console.log(`Payment ${payment.id} updated to FAILED`);
  } catch (error) {
    console.error('Error handling payment intent failed:', error);
  }
};

/**
 * Handle refunded charge
 * @param {Object} charge - Stripe charge object
 */
const handleChargeRefunded = async (charge) => {
  try {
    // Get payment intent ID from charge
    const paymentIntentId = charge.payment_intent;
    
    // Find payment by Stripe payment intent ID
    const payment = await prisma.payment.findFirst({
      where: { stripePaymentId: paymentIntentId },
      include: {
        transactions: true,
        auctionPayment: true
      }
    });
    
    if (!payment) {
      console.log(`Payment not found for payment intent: ${paymentIntentId}`);
      return;
    }
    
    // Update payment status to REFUNDED
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: 'REFUNDED' }
    });
    
    // If it's an auction payment, update auction payment status
    if (payment.auctionPayment) {
      await prisma.auctionPayment.update({
        where: { id: payment.auctionPayment.id },
        data: { status: 'REFUNDED' }
      });
    }
    
    // Create new transaction for refund if it doesn't exist
    const refundTransaction = await prisma.transaction.findFirst({
      where: {
        paymentId: payment.id,
        type: 'REFUND'
      }
    });
    
    if (!refundTransaction) {
      await prisma.transaction.create({
        data: {
          paymentId: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: 'COMPLETED',
          type: 'REFUND',
          description: 'Refund for payment'
        }
      });
    }
    
    console.log(`Payment ${payment.id} updated to REFUNDED`);
  } catch (error) {
    console.error('Error handling charge refunded:', error);
  }
};

export default {
  handleStripeWebhook
}; 