import express from 'express'
import {
  uploadProduct,
  getMyProducts,
  getAllProducts
} from '../controllers/product.controller.js'

import authMiddleware from '../middleware/auth.middleware.js'
import {requireRole} from '../middleware/role.js'
import { getProductDetailWithBids } from '../controllers/product.controller.js'


const router = express.Router()

router.get('/:id/detail', getProductDetailWithBids)


// 🔓 Public: get all products
router.get('/', getAllProducts)

router.get('/mine', authMiddleware, requireRole(['SELLER']), getMyProducts)

router.post('/', authMiddleware, requireRole(['SELLER']), uploadProduct)


export default router
