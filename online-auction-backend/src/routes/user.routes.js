import express from 'express'
import  authMiddleware  from '../middleware/auth.middleware.js'
import { assignPackage, getUserPackages } from '../controllers/user.controller.js'


const router = express.Router()
// already defined:
router.post('/:id/packages', authMiddleware, assignPackage)

// ✅ add this line below it:
router.get('/:id/packages', authMiddleware, getUserPackages)


export default router
