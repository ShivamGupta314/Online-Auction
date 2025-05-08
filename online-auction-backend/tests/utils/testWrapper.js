/**
 * Test wrapper helper to facilitate testing
 * This file provides utilities to simplify test execution
 */

import { jest } from '@jest/globals';
import socketService from '../../src/utils/socketService.js';
import stripeService from '../../src/utils/stripeService.js';
import emailService from '../../src/utils/emailService.js';

// Setup mock for Socket.IO
const setupSocketMock = () => {
  const mockIo = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn()
  };
  
  // Mock Socket.IO methods
  socketService.getIO = jest.fn().mockReturnValue(mockIo);
  socketService.emitNewBid = jest.fn();
  socketService.sendUserNotification = jest.fn();
  socketService.broadcastToRole = jest.fn();
  
  return mockIo;
};

// Setup mock for Stripe service
const setupStripeMock = () => {
  // Mock Stripe methods
  stripeService.createCustomer = jest.fn().mockResolvedValue({ id: 'cus_mock123' });
  stripeService.createPaymentMethod = jest.fn().mockResolvedValue({ id: 'pm_mock123' });
  stripeService.processPayment = jest.fn().mockResolvedValue({ id: 'pay_mock123', status: 'succeeded' });
  
  return stripeService;
};

// Setup mock for Email service
const setupEmailMock = () => {
  // Mock Email methods
  emailService.sendEmail = jest.fn().mockResolvedValue({ success: true, messageId: 'mock123' });
  emailService.initializeTransporter = jest.fn().mockResolvedValue(true);
  
  return emailService;
};

export { 
  setupSocketMock,
  setupStripeMock,
  setupEmailMock
}; 