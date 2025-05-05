import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import stripeService from '../src/utils/stripeService.js';
import readline from 'readline';

dotenv.config();
const prisma = new PrismaClient();

// Create readline interface for CLI input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Prompt user for input
 * @param {string} question - Question to ask user
 * @returns {Promise<string>} User input
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Test creating a customer in Stripe
 * @param {Object} userData - User data
 * @returns {Promise<Object>} Stripe customer
 */
async function testCreateCustomer(userData) {
  console.log('Testing Stripe customer creation...');
  const customer = await stripeService.createCustomer({
    name: userData.username,
    email: userData.email,
    userId: userData.id
  });
  console.log('✅ Customer created:', customer.id);
  return customer;
}

/**
 * Test creating a payment method in Stripe
 * @param {Object} paymentData - Payment method data
 * @returns {Promise<Object>} Stripe payment method
 */
async function testCreatePaymentMethod(paymentData) {
  console.log('Testing payment method creation...');
  const paymentMethod = await stripeService.createPaymentMethod({
    cardNumber: paymentData.cardNumber,
    expiryMonth: paymentData.expiryMonth,
    expiryYear: paymentData.expiryYear,
    cvv: paymentData.cvv
  });
  console.log('✅ Payment method created:', paymentMethod.id);
  return paymentMethod;
}

/**
 * Test attaching a payment method to a customer
 * @param {string} paymentMethodId - Stripe payment method ID
 * @param {string} customerId - Stripe customer ID
 * @returns {Promise<Object>} Attached payment method
 */
async function testAttachPaymentMethod(paymentMethodId, customerId) {
  console.log('Testing attaching payment method to customer...');
  const result = await stripeService.attachPaymentMethod(paymentMethodId, customerId);
  console.log('✅ Payment method attached');
  return result;
}

/**
 * Test creating a payment intent
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} Stripe payment intent
 */
async function testCreatePaymentIntent(paymentData) {
  console.log('Testing payment intent creation...');
  const paymentIntent = await stripeService.createPaymentIntent({
    amount: paymentData.amount,
    currency: 'usd',
    customerId: paymentData.customerId,
    paymentMethodId: paymentData.paymentMethodId,
    description: 'Test payment',
    metadata: {
      userId: paymentData.userId.toString(),
      test: 'true'
    }
  });
  console.log('✅ Payment intent created:', paymentIntent.id);
  console.log(`Status: ${paymentIntent.status}`);
  return paymentIntent;
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    console.log('🔍 STRIPE INTEGRATION TEST');
    console.log('=========================');
    
    // Prompt for test credit card
    console.log('\n📋 Using Stripe test cards:');
    console.log('- 4242 4242 4242 4242: Successful payment');
    console.log('- 4000 0000 0000 0002: Declined payment');
    
    // Get test user data
    const email = await prompt('\nEnter test email: ');
    const username = await prompt('Enter test username: ');
    const cardNumber = await prompt('Enter test card number (default: 4242 4242 4242 4242): ') || '4242424242424242';
    const expiryMonth = parseInt(await prompt('Enter expiry month (default: 12): ') || '12');
    const expiryYear = parseInt(await prompt('Enter expiry year (default: 2030): ') || '2030');
    const cvv = await prompt('Enter CVV (default: 123): ') || '123';
    const amount = parseFloat(await prompt('Enter payment amount in dollars (default: 10.99): ') || '10.99');
    
    // Create test user in database if doesn't exist
    let user = await prisma.user.findUnique({ 
      where: { email } 
    });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          username,
          email,
          password: 'hashedPassword', // In production, this would be hashed
          role: 'BIDDER'
        }
      });
      console.log('✅ Test user created in database');
    } else {
      console.log('✅ Using existing user from database');
    }
    
    // Run Stripe tests
    const customer = await testCreateCustomer({
      username,
      email,
      id: user.id
    });
    
    const paymentMethod = await testCreatePaymentMethod({
      cardNumber,
      expiryMonth,
      expiryYear,
      cvv
    });
    
    await testAttachPaymentMethod(paymentMethod.id, customer.id);
    
    const paymentIntent = await testCreatePaymentIntent({
      amount,
      customerId: customer.id,
      paymentMethodId: paymentMethod.id,
      userId: user.id
    });
    
    // Store the payment in our database
    const dbPayment = await prisma.payment.create({
      data: {
        amount,
        currency: 'USD',
        status: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
        stripePaymentId: paymentIntent.id,
        paymentMethod: {
          create: {
            type: 'credit_card',
            userId: user.id,
            stripeCustomerId: customer.id,
            lastFourDigits: paymentMethod.card.last4,
            expiryMonth: paymentMethod.card.exp_month,
            expiryYear: paymentMethod.card.exp_year,
            isDefault: true
          }
        },
        transactions: {
          create: {
            amount,
            currency: 'USD',
            status: paymentIntent.status === 'succeeded' ? 'COMPLETED' : 'PENDING', 
            type: 'PACKAGE_PURCHASE',
            description: 'Test payment',
            reference: paymentIntent.id
          }
        }
      }
    });
    
    console.log(`✅ Payment recorded in database with ID: ${dbPayment.id}`);
    
    console.log('\n🎉 All tests completed successfully!');
    
    // Prompt for cleanup
    const shouldCleanup = await prompt('\nDo you want to clean up test data? (y/n): ');
    
    if (shouldCleanup.toLowerCase() === 'y') {
      // Delete the payment and related records
      await prisma.transaction.deleteMany({
        where: { paymentId: dbPayment.id }
      });
      
      await prisma.payment.delete({
        where: { id: dbPayment.id }
      });
      
      await prisma.paymentMethod.deleteMany({
        where: { userId: user.id }
      });
      
      console.log('✅ Test data cleaned up');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

// Run the tests
runTests(); 