import express from 'express'
import {
  uploadProduct,
  getMyProducts,
  getAllProducts,
  getProductDetailWithBids,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller.js'
import auctionService from '../services/auction.service.js'
import authMiddleware from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'
import { productSchema } from '../validators/product.validator.js'
import { productUpdateSchema } from '../validators/product.validator.js'

const router = express.Router()

router.get('/:id/detail', getProductDetailWithBids)

// 🔓 Public: get all products
router.get('/', getAllProducts)

router.get('/mine', authMiddleware, requireRole(['SELLER']), getMyProducts)

router.post(
  '/',
  authMiddleware,
  requireRole(['SELLER']),
  validate(productSchema),
  uploadProduct
)

router.put(
  '/:id',
  authMiddleware,
  requireRole(['SELLER']),
  validate(productUpdateSchema),
  updateProduct
)

router.delete(
  '/:id',
  authMiddleware,
  requireRole(['SELLER']),
  deleteProduct
)

// New route for getting auction timer - this will emit a WebSocket event
router.get('/:id/timer', authMiddleware, async (req, res) => {
  try {
    const productId = parseInt(req.params.id)
    const timeRemaining = await auctionService.emitAuctionTimerUpdates(productId)
    
    res.json({ 
      productId, 
      timeRemaining 
    })
  } catch (error) {
    console.error('Error in timer update:', error)
    res.status(500).json({ error: 'Failed to get timer update' })
  }
})

export default router
