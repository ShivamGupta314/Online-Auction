import express from 'express'
import { placeBid, getBidsForProduct } from '../controllers/bid.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.js'
import { getHighestBid } from '../controllers/bid.controller.js'
import { getBidSummary } from '../controllers/bid.controller.js'
import { getPublicBidHighlight } from '../controllers/bid.controller.js'


const router = express.Router()


// Protect this route — SELLERs only
router.get(
    '/product/:id/summary',
    authMiddleware,
    requireRole(['SELLER']),
    getBidSummary
  )


// 🔐 BIDDER-only
router.post('/', authMiddleware, requireRole(['BIDDER']), placeBid)

// 🔓 Public: View bids for product
router.get('/product/:id', getBidsForProduct)

router.get('/product/:id/highest', getHighestBid)

router.get('/product/:id/summary', getBidSummary)

router.get('/product/:id/highlight-bid', getPublicBidHighlight)

export default router
