import express from 'express'
import {
  placeBid,
  getMyBids,
  getBidsForProduct,
  getHighestBid,
  getBidSummary,
  getPublicBidHighlight
} from '../controllers/bid.controller.js'

import authMiddleware from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'
import { bidSchema } from '../validators/bid.validator.js'

const router = express.Router()

// 🔐 BIDDER-only: Place a new bid
router.post(
  '/',
  authMiddleware,
  requireRole(['BIDDER']),
  validate(bidSchema),
  placeBid
)

// 🔐 BIDDER-only: View personal bids (with isWinning)
router.get(
  '/mine',
  authMiddleware,
  requireRole(['BIDDER']),
  getMyBids
)

// 🔐 SELLER-only: View bid summary for a product
router.get(
  '/product/:id/summary',
  authMiddleware,
  requireRole(['SELLER']),
  getBidSummary
)

// 🔓 Public routes
router.get('/product/:id', getBidsForProduct)
router.get('/product/:id/highest', getHighestBid)
router.get('/product/:id/highlight-bid', getPublicBidHighlight)

export default router
