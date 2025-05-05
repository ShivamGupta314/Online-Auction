import express from 'express';
import webhookController from '../controllers/webhook.controller.js';

const router = express.Router();

// Stripe webhook needs raw body for signature verification
router.post('/stripe', express.raw({ type: 'application/json' }), webhookController.handleStripeWebhook);

export default router; 