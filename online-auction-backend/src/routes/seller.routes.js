import express from 'express'
import {
    getSellerDashboard,
    exportSellerDashboardCSV,
    exportSellerDashboardExcel
} from '../controllers/product.controller.js'

import authMiddleware from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.js'

const router = express.Router()

router.get('/summary', authMiddleware, requireRole(['SELLER']), getSellerDashboard)

router.get('/summary/csv', authMiddleware, requireRole(['SELLER']), exportSellerDashboardCSV)

router.get(
    '/summary/excel',
    authMiddleware,
    requireRole(['SELLER']),
    exportSellerDashboardExcel
)


export default router
