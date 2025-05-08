import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with the API key from environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Initialize Stripe with the API key from environment variables
let stripe;

try {
  // Check if STRIPE_SECRET_KEY is provided
  if (!STRIPE_SECRET_KEY && process.env.NODE_ENV !== 'test') {
    console.warn('Warning: STRIPE_SECRET_KEY is not defined. Payment functionality will be limited.');
  } else if (process.env.NODE_ENV !== 'test') {
    stripe = new Stripe(STRIPE_SECRET_KEY);
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

// Set this to true if you want to mock Stripe responses
const USE_TEST_MOCKS = process.env.NODE_ENV === 'test';

/**
 * Create a Stripe customer
 * @param {Object} params - Customer data
 * @returns {Promise<Object>} Stripe customer object
 */
export const createCustomer = async (params) => {
  if (USE_TEST_MOCKS) {
    console.log('[Test] Creating mock Stripe customer');
    return { id: 'cus_mock123' };
  }

  if (!stripe) {
    console.warn('Stripe is not initialized');
    return { id: 'cus_mock_fallback', error: 'Stripe not initialized' };
  }

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
  if (USE_TEST_MOCKS) {
    console.log('[Test] Creating mock payment method');
    // Handle different paymentMethodDetails structures
    const cardDetails = paymentMethodDetails.card || 
      (paymentMethodDetails.cardNumber ? {
        last4: paymentMethodDetails.cardNumber.slice(-4),
        exp_month: paymentMethodDetails.expiryMonth || 12,
        exp_year: paymentMethodDetails.expiryYear || 2030
      } : {
        last4: '4242',
        exp_month: 12,
        exp_year: 2030
      });

    return { 
      id: 'pm_mock123',
      type: paymentMethodDetails.type || 'card',
      card: {
        last4: cardDetails.last4,
        exp_month: cardDetails.exp_month,
        exp_year: cardDetails.exp_year
      }
    };
  }

  if (!stripe) {
    console.warn('Stripe is not initialized');
    return { 
      id: 'pm_mock_fallback', 
      type: 'card',
      card: {
        last4: '4242',
        exp_month: 12,
        exp_year: 2030
      },
      error: 'Stripe not initialized'
    };
  }

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
  if (USE_TEST_MOCKS) {
    console.log('[Test] Mocking attachment of payment method');
    return { 
      id: paymentMethodId,
      customer: customerId
    };
  }
  
  if (!stripe) {
    console.warn('Stripe is not initialized');
    return { 
      id: paymentMethodId,
      customer: customerId,
      error: 'Stripe not initialized'
    };
  }
  
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
  if (USE_TEST_MOCKS) {
    console.log('[Test] Creating mock payment intent');
    return { 
      id: 'pi_mock123',
      amount: params.amount,
      currency: params.currency || 'usd',
      client_secret: 'pi_mock123_secret_mock123',
      status: 'requires_payment_method'
    };
  }

  if (!stripe) {
    console.warn('Stripe is not initialized');
    return { 
      id: 'pi_mock_fallback',
      amount: params.amount,
      currency: params.currency || 'usd',
      client_secret: 'pi_mock_fallback_secret',
      status: 'requires_payment_method',
      error: 'Stripe not initialized'
    };
  }

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
  if (USE_TEST_MOCKS) {
    return { 
      id: paymentIntentId,
      status: 'succeeded'
    };
  }
  
  if (!stripe) {
    console.warn('Stripe is not initialized');
    return { 
      id: paymentIntentId,
      status: 'succeeded',
      error: 'Stripe not initialized'
    };
  }
  
  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (error) {
    console.error(`Error retrieving payment intent ${paymentIntentId}:`, error);
    throw error;
  }
};

/**
 * Create a refund
 * @param {string} paymentIntentId - Payment intent ID to refund
 * @param {number} amount - Amount to refund (optional, defaults to full amount)
 * @returns {Promise<Object>} Refund object
 */
export const createRefund = async (paymentIntentId, amount = null) => {
  if (USE_TEST_MOCKS) {
    return {
      id: 're_mock123',
      payment_intent: paymentIntentId,
      amount: amount || 10000,
      status: 'succeeded'
    };
  }
  
  if (!stripe) {
    console.warn('Stripe is not initialized');
    return { 
      id: 're_mock_fallback',
      payment_intent: paymentIntentId,
      amount: amount || 10000,
      status: 'succeeded',
      error: 'Stripe not initialized'
    };
  }
  
  try {
    const refundParams = {
      payment_intent: paymentIntentId
    };
    
    if (amount) {
      refundParams.amount = Math.round(amount * 100);
    }
    
    return await stripe.refunds.create(refundParams);
  } catch (error) {
    console.error('Error creating refund:', error);
    throw error;
  }
};

/**
 * Create a transfer to another Stripe account (e.g., seller)
 * @param {Object} params - Transfer parameters
 * @returns {Promise<Object>} Transfer object
 */
export const createTransfer = async (params) => {
  if (USE_TEST_MOCKS) {
    return {
      id: 'tr_mock123',
      amount: Math.round(params.amount * 100),
      currency: params.currency || 'usd',
      destination: params.destination
    };
  }
  
  if (!stripe) {
    console.warn('Stripe is not initialized');
    return { 
      id: 'tr_mock_fallback',
      amount: Math.round(params.amount * 100),
      currency: params.currency || 'usd',
      destination: params.destination,
      error: 'Stripe not initialized'
    };
  }
  
  try {
    return await stripe.transfers.create({
      amount: Math.round(params.amount * 100),
      currency: params.currency || 'usd',
      destination: params.destination,
      description: params.description,
      metadata: params.metadata || {}
    });
  } catch (error) {
    console.error('Error creating transfer:', error);
    throw error;
  }
};

/**
 * Process a payment (for both Packages and Auctions)
 */
export const processPayment = async (params) => {
  if (params.type === 'package') {
    return await createPackagePayment(params);
  } else if (params.type === 'auction') {
    return await createAuctionPayment(params);
  } else {
    throw new Error('Invalid payment type');
  }
};

// Export default object with all functions
export default {
  createCustomer,
  createPaymentMethod,
  attachPaymentMethod,
  createPaymentIntent,
  createPackagePayment,
  createAuctionPayment,
  retrievePaymentIntent,
  createRefund,
  createTransfer,
  processPayment
}; 