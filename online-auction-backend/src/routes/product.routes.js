import express from 'express'
import { uploadProduct, getMyProducts } from '../controllers/product.controller.js'
import { requireRole } from '../middleware/role.js'

const router = express.Router()

// 🔐 Only SELLERs can upload and view their own products
router.post('/', requireRole(['SELLER']), uploadProduct)
router.get('/mine', requireRole(['SELLER']), getMyProducts)

export default router
