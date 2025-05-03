import express from 'express'
import { register, login, getMe } from '../controllers/auth.controller.js'
import authMiddleware from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.js'
import { registerSchema, loginSchema } from '../validators/auth.validator.js'

const router = express.Router()

// 🔐 Register + Login (validated with Zod)
router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)

// 🔐 Get current logged-in user
router.get('/me', authMiddleware, getMe)

export default router
