import express from 'express'
import {
  sendUserNotification,
  sendRoleBroadcast,
  notifyProductBidders
} from '../controllers/notification.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'
import { 
  userNotificationSchema,
  roleBroadcastSchema,
  productBiddersNotificationSchema 
} from '../validators/notification.validator.js'

const router = express.Router()

// All routes require authentication
router.use(authMiddleware)

// Admin-only routes
router.post('/user',
  requireRole(['ADMIN']),
  validate(userNotificationSchema),
  sendUserNotification
)

router.post('/broadcast',
  requireRole(['ADMIN']),
  validate(roleBroadcastSchema),
  sendRoleBroadcast
)

// Admin or seller route (for their own products)
router.post('/product-bidders',
  validate(productBiddersNotificationSchema),
  notifyProductBidders
)

export default router 