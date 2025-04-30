import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

// Routes
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'

// Middlewares
import authMiddleware from './middleware/auth.middleware.js'

dotenv.config()

const app = express()

// Enable CORS + JSON
app.use(cors())
app.use(express.json())

// 🔍 Debug: log every incoming request
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`)
  next()
})

// 🆓 Public routes
app.use('/api/auth', authRoutes)

// 🔐 Protected routes (require JWT)
app.use('/api/products', authMiddleware, productRoutes)

// Basic test route
app.get('/', (_, res) => res.send('API is running'))

export default app
