import express from 'express'
import {
  uploadProduct,
  getMyProducts,
  getAllProducts,
  getProductDetailWithBids,
  updateProduct // ⬅️ add this
} from '../controllers/product.controller.js'


import { productUpdateSchema } from '../validators/product.validator.js'
import authMiddleware from '../middleware/auth.middleware.js'
import {requireRole} from '../middleware/role.js'
import { validate } from '../middleware/validate.js'
import { productSchema } from '../validators/product.validator.js'


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




export default router
