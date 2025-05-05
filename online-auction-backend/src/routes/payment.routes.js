import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

// Apply authentication middleware to all payment routes
router.use(authMiddleware);

// Payment methods routes
router.post('/methods', paymentController.createPaymentMethod);
router.get('/methods', paymentController.getPaymentMethods);
router.put('/methods/:paymentMethodId/default', paymentController.setDefaultPaymentMethod);
router.delete('/methods/:paymentMethodId', paymentController.deletePaymentMethod);

// Package payment routes
router.post('/package', paymentController.processPackagePayment);

// Auction payment routes
router.post('/auction', paymentController.processAuctionPayment);

// Escrow management routes
router.post('/escrow/:auctionPaymentId/release', paymentController.releaseEscrow);
router.post('/escrow/:auctionPaymentId/refund', paymentController.refundAuctionPayment);

// General payment routes
router.get('/:paymentId', paymentController.getPaymentDetails);

export default router; 