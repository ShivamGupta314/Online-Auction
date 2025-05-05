#!/usr/bin/env node

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:5001/api';
const EMAIL = 'test@example.com';
const PASSWORD = 'password123';

// Main test function
async function testPaymentAPI() {
  console.log('\n===== PAYMENT API TEST =====\n');
  
  try {
    // Step 1: Login to get auth token
    console.log('Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: EMAIL,
      password: PASSWORD
    });
    
    if (!loginResponse.data.token) {
      console.error('Failed to login - no token received');
      return;
    }
    
    const token = loginResponse.data.token;
    console.log('Successfully logged in and received token');
    
    // Create axios instance with auth header
    const api = axios.create({
      baseURL: API_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    // Step 2: Test getting payment methods
    console.log('\nTesting GET /payments/methods...');
    try {
      const methodsResponse = await api.get('/payments/methods');
      console.log(`Payment methods found: ${methodsResponse.data.data.length}`);
    } catch (error) {
      console.error('Error getting payment methods:', error.response?.data || error.message);
    }
    
    // Step 3: Test creating a payment method
    console.log('\nTesting POST /payments/methods...');
    try {
      const createMethodResponse = await api.post('/payments/methods', {
        cardNumber: '4242424242424242',
        expiryMonth: 12,
        expiryYear: 2030,
        cvv: '123'
      });
      
      console.log('Payment method created successfully:', {
        id: createMethodResponse.data.data.id,
        type: createMethodResponse.data.data.type,
        last4: createMethodResponse.data.data.lastFourDigits
      });
      
      // Save the payment method ID for later tests
      const paymentMethodId = createMethodResponse.data.data.id;
      
      // Step 4: Test setting default payment method
      console.log(`\nTesting PUT /payments/methods/${paymentMethodId}/default...`);
      try {
        const defaultResponse = await api.put(`/payments/methods/${paymentMethodId}/default`);
        console.log('Payment method set as default:', defaultResponse.data.success);
      } catch (error) {
        console.error('Error setting default payment method:', error.response?.data || error.message);
      }
      
      // Step 5: Test getting packages (needed for package payment test)
      console.log('\nTesting GET /packages...');
      let packageId;
      try {
        const packagesResponse = await api.get('/packages');
        console.log(`Packages found: ${packagesResponse.data.data.length}`);
        
        if (packagesResponse.data.data.length > 0) {
          packageId = packagesResponse.data.data[0].id;
          console.log(`Selected package ID for test: ${packageId}`);
          
          // Step 6: Test package payment (only if packages exist)
          console.log('\nTesting POST /payments/package...');
          try {
            const packagePaymentResponse = await api.post('/payments/package', {
              packageId,
              paymentMethodId
            });
            
            console.log('Package payment result:', {
              success: packagePaymentResponse.data.success,
              paymentId: packagePaymentResponse.data.data?.id
            });
          } catch (error) {
            console.error('Error making package payment:', error.response?.data || error.message);
          }
        }
      } catch (error) {
        console.error('Error getting packages:', error.response?.data || error.message);
      }
      
      // Step 7: Test deleting payment method
      console.log(`\nTesting DELETE /payments/methods/${paymentMethodId}...`);
      try {
        const deleteResponse = await api.delete(`/payments/methods/${paymentMethodId}`);
        console.log('Payment method deleted:', deleteResponse.data.success);
      } catch (error) {
        console.error('Error deleting payment method:', error.response?.data || error.message);
      }
      
    } catch (error) {
      console.error('Error creating payment method:', error.response?.data || error.message);
    }
    
    console.log('\n===== PAYMENT API TEST COMPLETE =====\n');
    
  } catch (error) {
    console.error('Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testPaymentAPI(); 