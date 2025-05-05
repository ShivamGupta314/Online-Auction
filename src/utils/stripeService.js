import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with the API key from environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe with the API key from environment variables
const stripe = new Stripe(STRIPE_SECRET_KEY);

/**
 * Create a Stripe customer
 * @param {Object} params - Customer data
 * @returns {Promise<Object>} Stripe customer object
 */
export const createCustomer = async (params) => {
  try {
    const customer = await stripe.customers.create({
      name: params.name,
      email: params.email,
      metadata: {
        userId: params.userId.toString()
      }
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw new Error(`Failed to create customer: ${error.message}`);
  }
};

/**
 * Create a payment method (e.g., credit card)
 * @param {Object} paymentMethodDetails - Payment method details
 * @returns {Promise<Object>} Stripe payment method object
 */
export const createPaymentMethod = async (paymentMethodDetails) => {
  try {
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        number: paymentMethodDetails.cardNumber,
        exp_month: paymentMethodDetails.expiryMonth,
        exp_year: paymentMethodDetails.expiryYear,
        cvc: paymentMethodDetails.cvv
      }
    });
    return paymentMethod;
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw new Error(`Failed to create payment method: ${error.message}`);
  }
};

/**
 * Attach payment method to customer
 * @param {string} paymentMethodId - Stripe payment method ID
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} Attached payment method
 */
export const attachPaymentMethod = async (paymentMethodId, customerId) => {
  try {
    const paymentMethod = await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });
    return paymentMethod;
  } catch (error) {
    console.error('Error attaching payment method to customer:', error);
    throw new Error(`Failed to attach payment method: ${error.message}`);
  }
};

/**
 * Create a payment intent (authorize a payment)
 * @param {Object} params - Payment intent parameters
 * @returns {Promise<Object>} Stripe payment intent object
 */
export const createPaymentIntent = async (params) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: params.currency || 'usd',
      customer: params.customerId,
      payment_method: params.paymentMethodId,
      description: params.description || 'Online Auction payment',
      metadata: {
        userId: params.userId.toString(),
        ...(params.metadata || {})
      },
      confirm: true, // Confirm the payment immediately
      return_url: params.returnUrl || process.env.FRONTEND_URL
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new Error(`Failed to create payment: ${error.message}`);
  }
};

/**
 * Create a payment for package purchase
 * @param {Object} params - Payment parameters
 * @returns {Promise<Object>} Stripe payment intent object
 */
export const createPackagePayment = async (params) => {
  try {
    const paymentIntent = await createPaymentIntent({
      amount: params.amount,
      currency: params.currency || 'usd',
      customerId: params.customerId,
      paymentMethodId: params.paymentMethodId,
      description: `Package: ${params.packageName}`,
      metadata: {
        userId: params.userId.toString(),
        packageId: params.packageId.toString(),
        packageName: params.packageName,
        type: 'package_purchase'
      },
      returnUrl: `${process.env.FRONTEND_URL}/dashboard/packages/confirmation`
    });
    return paymentIntent;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a payment for auction purchase
 * @param {Object} params - Payment parameters
 * @returns {Promise<Object>} Stripe payment intent object
 */
export const createAuctionPayment = async (params) => {
  try {
    const paymentIntent = await createPaymentIntent({
      amount: params.amount,
      currency: params.currency || 'usd',
      customerId: params.customerId,
      paymentMethodId: params.paymentMethodId,
      description: `Auction: ${params.productName}`,
      metadata: {
        userId: params.userId.toString(),
        productId: params.productId.toString(),
        bidId: params.bidId.toString(),
        sellerId: params.sellerId.toString(),
        type: 'auction_payment'
      },
      returnUrl: `${process.env.FRONTEND_URL}/auctions/${params.productId}/payment/confirmation`
    });
    return paymentIntent;
  } catch (error) {
    throw error;
  }
};

/**
 * Retrieve a payment intent
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @returns {Promise<Object>} Stripe payment intent object
 */
export const retrievePaymentIntent = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    return paymentIntent;
  } catch (error) {
    console.error('Error retrieving payment intent:', error);
    throw new Error(`Failed to retrieve payment: ${error.message}`);
  }
};

/**
 * Create a refund
 * @param {string} paymentIntentId - Stripe payment intent ID
 * @param {number} amount - Amount to refund (in dollars)
 * @returns {Promise<Object>} Stripe refund object
 */
export const createRefund = async (paymentIntentId, amount = null) => {
  try {
    const refundParams = {
      payment_intent: paymentIntentId,
    };
    
    if (amount) {
      refundParams.amount = Math.round(amount * 100); // Convert to cents
    }
    
    const refund = await stripe.refunds.create(refundParams);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error(`Failed to create refund: ${error.message}`);
  }
};

/**
 * Create a transfer to a connected account (for marketplace use)
 * @param {Object} params - Transfer parameters
 * @returns {Promise<Object>} Stripe transfer object
 */
export const createTransfer = async (params) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(params.amount * 100), // Convert to cents
      currency: params.currency || 'usd',
      destination: params.connectedAccountId,
      transfer_group: params.transferGroup,
      metadata: params.metadata || {}
    });
    return transfer;
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw new Error(`Failed to create transfer: ${error.message}`);
  }
};

export default {
  createCustomer,
  createPaymentMethod,
  attachPaymentMethod,
  createPaymentIntent,
  createPackagePayment,
  createAuctionPayment,
  retrievePaymentIntent,
  createRefund,
  createTransfer
}; 