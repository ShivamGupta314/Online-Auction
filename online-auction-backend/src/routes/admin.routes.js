import express from 'express'
import {
  getAdminDashboard,
  getAllUsers,
  updateUserRole,
  getProblematicProducts
} from '../controllers/admin.controller.js'

import authMiddleware from '../middleware/auth.middleware.js'
import { requireRole } from '../middleware/role.js'
import { validate } from '../middleware/validate.js'
import { userRoleUpdateSchema } from '../validators/admin.validator.js'

const router = express.Router()

// All routes require ADMIN role
router.use(authMiddleware, requireRole(['ADMIN']))

// Get admin dashboard data
router.get('/dashboard', getAdminDashboard)

// Get all users
router.get('/users', getAllUsers)

// Update user role
router.put('/users/:id/role', validate(userRoleUpdateSchema), updateUserRole)

// Get problematic products (expired with no bids)
router.get('/products/problematic', getProblematicProducts)

export default router 