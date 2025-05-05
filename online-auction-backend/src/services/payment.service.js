import { prisma } from '../prismaClient.js';
import stripeService from '../utils/stripeService.js';

/**
 * Create a payment method for a user
 * @param {number} userId - User ID
 * @param {Object} paymentMethodData - Payment method details
 * @returns {Promise<Object>} Created payment method
 */
export const createPaymentMethod = async (userId, paymentMethodData) => {
  try {
    // Get or create Stripe customer
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        paymentMethods: {
          where: { stripeCustomerId: { not: null } },
          take: 1
        }
      }
    });

    let customerId;
    
    // If user has no Stripe customer ID yet, create one
    if (!user.paymentMethods.length) {
      const customer = await stripeService.createCustomer({
        name: user.username,
        email: user.email,
        userId: user.id
      });
      customerId = customer.id;
    } else {
      customerId = user.paymentMethods[0].stripeCustomerId;
    }

    // Create payment method in Stripe
    const stripePaymentMethod = await stripeService.createPaymentMethod({
      cardNumber: paymentMethodData.cardNumber,
      expiryMonth: paymentMethodData.expiryMonth,
      expiryYear: paymentMethodData.expiryYear,
      cvv: paymentMethodData.cvv
    });

    // Attach payment method to customer
    await stripeService.attachPaymentMethod(stripePaymentMethod.id, customerId);

    // Store payment method in database
    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        type: 'credit_card',
        userId: userId,
        stripeCustomerId: customerId,
        lastFourDigits: stripePaymentMethod.card.last4,
        expiryMonth: stripePaymentMethod.card.exp_month,
        expiryYear: stripePaymentMethod.card.exp_year,
        isDefault: !(await prisma.paymentMethod.count({ where: { userId } })) // First payment method is default
      }
    });

    return paymentMethod;
  } catch (error) {
    console.error('Error creating payment method:', error);
    throw error;
  }
};

/**
 * Get payment methods for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} List of payment methods
 */
export const getPaymentMethods = async (userId) => {
  try {
    const paymentMethods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { isDefault: 'desc' }
    });
    
    return paymentMethods.map(method => ({
      id: method.id,
      type: method.type,
      lastFourDigits: method.lastFourDigits,
      expiryMonth: method.expiryMonth,
      expiryYear: method.expiryYear,
      isDefault: method.isDefault,
      createdAt: method.createdAt
    }));
  } catch (error) {
    console.error('Error getting payment methods:', error);
    throw error;
  }
};

/**
 * Set a payment method as default
 * @param {number} userId - User ID
 * @param {number} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} Updated payment method
 */
export const setDefaultPaymentMethod = async (userId, paymentMethodId) => {
  try {
    // Ensure the payment method belongs to the user
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { 
        id: paymentMethodId,
        userId 
      }
    });

    if (!paymentMethod) {
      throw new Error('Payment method not found or does not belong to user');
    }

    // Clear default status from all user payment methods
    await prisma.paymentMethod.updateMany({
      where: { userId },
      data: { isDefault: false }
    });

    // Set the selected payment method as default
    const updatedPaymentMethod = await prisma.paymentMethod.update({
      where: { id: paymentMethodId },
      data: { isDefault: true }
    });

    return updatedPaymentMethod;
  } catch (error) {
    console.error('Error setting default payment method:', error);
    throw error;
  }
};

/**
 * Delete a payment method
 * @param {number} userId - User ID
 * @param {number} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} Deleted payment method
 */
export const deletePaymentMethod = async (userId, paymentMethodId) => {
  try {
    // Ensure the payment method belongs to the user
    const paymentMethod = await prisma.paymentMethod.findFirst({
      where: { 
        id: paymentMethodId,
        userId 
      }
    });

    if (!paymentMethod) {
      throw new Error('Payment method not found or does not belong to user');
    }

    // Cannot delete the default payment method if it's the only one
    if (paymentMethod.isDefault) {
      const count = await prisma.paymentMethod.count({ where: { userId } });
      if (count <= 1) {
        throw new Error('Cannot delete the only payment method');
      }
    }

    // Delete the payment method
    const deletedPaymentMethod = await prisma.paymentMethod.delete({
      where: { id: paymentMethodId }
    });

    // If the deleted method was default, set another one as default
    if (paymentMethod.isDefault) {
      const otherMethod = await prisma.paymentMethod.findFirst({
        where: { userId }
      });
      
      if (otherMethod) {
        await prisma.paymentMethod.update({
          where: { id: otherMethod.id },
          data: { isDefault: true }
        });
      }
    }

    return deletedPaymentMethod;
  } catch (error) {
    console.error('Error deleting payment method:', error);
    throw error;
  }
};

/**
 * Process a package purchase payment
 * @param {number} userId - User ID
 * @param {number} packageId - Package ID
 * @param {number} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} Payment details
 */
export const processPackagePayment = async (userId, packageId, paymentMethodId) => {
  try {
    // Start transaction
    return await prisma.$transaction(async (prisma) => {
      // Get package details
      const packageItem = await prisma.package.findUnique({
        where: { id: packageId }
      });
      
      if (!packageItem || !packageItem.isActive) {
        throw new Error('Package not found or is no longer available');
      }

      // Get payment method
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: { 
          id: paymentMethodId,
          userId 
        }
      });

      if (!paymentMethod) {
        throw new Error('Payment method not found or does not belong to user');
      }

      // Create Stripe payment
      const stripePayment = await stripeService.createPackagePayment({
        amount: packageItem.price,
        customerId: paymentMethod.stripeCustomerId,
        paymentMethodId: paymentMethodId,
        userId: userId,
        packageId: packageId,
        packageName: packageItem.name
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          amount: packageItem.price,
          status: stripePayment.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
          paymentMethodId: paymentMethod.id,
          stripePaymentId: stripePayment.id
        }
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          paymentId: payment.id,
          amount: packageItem.price,
          status: stripePayment.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
          type: 'PACKAGE_PURCHASE',
          description: `Purchase of ${packageItem.name} package`,
          reference: stripePayment.id,
          metadata: { packageId: packageId.toString() }
        }
      });

      // Calculate end date based on duration
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + packageItem.duration);

      // Create user package record
      const userPackage = await prisma.userPackage.create({
        data: {
          userId: userId,
          packageId: packageId,
          startDate: startDate,
          endDate: endDate,
          isActive: true,
          paymentId: payment.id,
          transactionId: stripePayment.id
        }
      });

      return {
        payment,
        transaction,
        userPackage,
        stripePaymentId: stripePayment.id,
        status: stripePayment.status,
        clientSecret: stripePayment.client_secret
      };
    });
  } catch (error) {
    console.error('Error processing package payment:', error);
    throw error;
  }
};

/**
 * Process an auction payment (winning bid)
 * @param {number} userId - Buyer user ID
 * @param {number} productId - Product ID
 * @param {number} bidId - Bid ID
 * @param {number} paymentMethodId - Payment method ID
 * @returns {Promise<Object>} Payment details
 */
export const processAuctionPayment = async (userId, productId, bidId, paymentMethodId) => {
  try {
    // Start transaction
    return await prisma.$transaction(async (prisma) => {
      // Get product details with seller and winning bid
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          seller: true,
          bids: {
            where: { id: bidId },
            include: { bidder: true }
          }
        }
      });
      
      if (!product) {
        throw new Error('Product not found');
      }

      if (product.bids.length === 0) {
        throw new Error('Bid not found');
      }

      const bid = product.bids[0];
      
      // Ensure auction has ended
      const now = new Date();
      if (now < product.endTime) {
        throw new Error('Auction has not ended yet');
      }

      // Ensure the buyer is the winning bidder
      if (bid.bidderId !== userId) {
        throw new Error('Only the winning bidder can make this payment');
      }

      // Get payment method
      const paymentMethod = await prisma.paymentMethod.findFirst({
        where: { 
          id: paymentMethodId,
          userId 
        }
      });

      if (!paymentMethod) {
        throw new Error('Payment method not found or does not belong to user');
      }

      // Create Stripe payment
      const stripePayment = await stripeService.createAuctionPayment({
        amount: bid.price,
        customerId: paymentMethod.stripeCustomerId,
        paymentMethodId: paymentMethodId,
        userId: userId,
        productId: productId,
        productName: product.name,
        bidId: bidId,
        sellerId: product.sellerId
      });

      // Create payment record
      const payment = await prisma.payment.create({
        data: {
          amount: bid.price,
          status: stripePayment.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
          paymentMethodId: paymentMethod.id,
          stripePaymentId: stripePayment.id
        }
      });

      // Create transaction record
      const transaction = await prisma.transaction.create({
        data: {
          paymentId: payment.id,
          amount: bid.price,
          status: stripePayment.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
          type: 'AUCTION_PAYMENT',
          description: `Payment for auction: ${product.name}`,
          reference: stripePayment.id,
          metadata: { 
            productId: productId.toString(),
            bidId: bidId.toString(),
            sellerId: product.sellerId.toString()
          }
        }
      });

      // Create auction payment record
      const auctionPayment = await prisma.auctionPayment.create({
        data: {
          paymentId: payment.id,
          productId: productId,
          buyerId: userId,
          sellerId: product.sellerId,
          bidId: bidId,
          status: stripePayment.status === 'succeeded' ? 'PAID' : 'PENDING',
          escrowHeld: true
        }
      });

      // Update product payment status
      await prisma.product.update({
        where: { id: productId },
        data: { paymentReceived: stripePayment.status === 'succeeded' }
      });

      return {
        payment,
        transaction,
        auctionPayment,
        stripePaymentId: stripePayment.id,
        status: stripePayment.status,
        clientSecret: stripePayment.client_secret
      };
    });
  } catch (error) {
    console.error('Error processing auction payment:', error);
    throw error;
  }
};

/**
 * Release funds from escrow to seller
 * @param {number} auctionPaymentId - Auction payment ID
 * @returns {Promise<Object>} Updated auction payment
 */
export const releaseEscrow = async (auctionPaymentId) => {
  try {
    // Start transaction
    return await prisma.$transaction(async (prisma) => {
      // Get auction payment details
      const auctionPayment = await prisma.auctionPayment.findUnique({
        where: { id: auctionPaymentId },
        include: {
          payment: true,
          product: {
            include: { seller: true }
          }
        }
      });
      
      if (!auctionPayment) {
        throw new Error('Auction payment not found');
      }

      if (!auctionPayment.escrowHeld) {
        throw new Error('Funds have already been released from escrow');
      }

      if (auctionPayment.status !== 'PAID') {
        throw new Error('Cannot release funds for unpaid auction');
      }

      // Update auction payment status
      const updatedAuctionPayment = await prisma.auctionPayment.update({
        where: { id: auctionPaymentId },
        data: {
          escrowHeld: false,
          status: 'RELEASED_TO_SELLER'
        }
      });

      // Create transaction record for escrow release
      await prisma.transaction.create({
        data: {
          paymentId: auctionPayment.paymentId,
          amount: auctionPayment.payment.amount,
          status: 'COMPLETED',
          type: 'ESCROW_RELEASE',
          description: `Release of funds to seller for: ${auctionPayment.product.name}`,
          metadata: { 
            productId: auctionPayment.productId.toString(),
            sellerId: auctionPayment.sellerId.toString(),
            buyerId: auctionPayment.buyerId.toString()
          }
        }
      });

      // For Stripe connected accounts, implement an actual transfer here
      
      return updatedAuctionPayment;
    });
  } catch (error) {
    console.error('Error releasing escrow:', error);
    throw error;
  }
};

/**
 * Process a refund for an auction payment
 * @param {number} auctionPaymentId - Auction payment ID
 * @param {string} reason - Reason for refund
 * @returns {Promise<Object>} Updated auction payment
 */
export const refundAuctionPayment = async (auctionPaymentId, reason) => {
  try {
    // Start transaction
    return await prisma.$transaction(async (prisma) => {
      // Get auction payment details
      const auctionPayment = await prisma.auctionPayment.findUnique({
        where: { id: auctionPaymentId },
        include: {
          payment: true
        }
      });
      
      if (!auctionPayment) {
        throw new Error('Auction payment not found');
      }

      if (!auctionPayment.escrowHeld) {
        throw new Error('Cannot refund payment after funds have been released');
      }

      if (auctionPayment.status !== 'PAID') {
        throw new Error('Cannot refund unpaid auction');
      }

      // Process refund through Stripe
      const refund = await stripeService.createRefund(auctionPayment.payment.stripePaymentId);

      // Update auction payment status
      const updatedAuctionPayment = await prisma.auctionPayment.update({
        where: { id: auctionPaymentId },
        data: {
          status: 'REFUNDED'
        }
      });

      // Update payment status
      await prisma.payment.update({
        where: { id: auctionPayment.paymentId },
        data: {
          status: 'REFUNDED'
        }
      });

      // Create transaction record for refund
      await prisma.transaction.create({
        data: {
          paymentId: auctionPayment.paymentId,
          amount: auctionPayment.payment.amount,
          status: 'COMPLETED',
          type: 'REFUND',
          description: `Refund for auction: ${reason || 'Buyer requested refund'}`,
          reference: refund.id,
          metadata: { 
            productId: auctionPayment.productId.toString(),
            buyerId: auctionPayment.buyerId.toString()
          }
        }
      });

      return updatedAuctionPayment;
    });
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

/**
 * Get payment details by ID
 * @param {number} paymentId - Payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentById = async (paymentId) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        paymentMethod: true,
        transactions: true,
        userPackages: true,
        auctionPayment: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    return payment;
  } catch (error) {
    console.error('Error getting payment details:', error);
    throw error;
  }
};

export default {
  createPaymentMethod,
  getPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  processPackagePayment,
  processAuctionPayment,
  releaseEscrow,
  refundAuctionPayment,
  getPaymentById
}; 