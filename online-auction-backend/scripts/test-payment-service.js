import { getPaymentMethods, createPaymentMethod } from '../src/services/payment.service.js';

async function testPaymentService() {
  console.log('Testing payment service...');
  
  try {
    // Get our test user ID
    const userId = 465; // This should be the ID of our test user
    
    console.log(`Testing getPaymentMethods for userId: ${userId}`);
    
    try {
      // Get payment methods for the user
      const paymentMethods = await getPaymentMethods(userId);
      console.log('Payment methods found:', paymentMethods.length);
      console.log('Payment methods:', paymentMethods);
    } catch (error) {
      console.error('Error getting payment methods:', error);
    }
    
    console.log('\nWould you like to create a test payment method? (y/n)');
    process.stdin.once('data', async (data) => {
      const answer = data.toString().trim().toLowerCase();
      
      if (answer === 'y') {
        try {
          console.log('Creating a test payment method...');
          const paymentMethod = await createPaymentMethod(userId, {
            cardNumber: '4242424242424242',
            expiryMonth: 12,
            expiryYear: 2030,
            cvv: '123'
          });
          
          console.log('Payment method created:', paymentMethod);
        } catch (error) {
          console.error('Error creating payment method:', error);
        }
      }
      
      process.exit(0);
    });
  } catch (error) {
    console.error('Error testing payment service:', error);
    process.exit(1);
  }
}

testPaymentService(); 