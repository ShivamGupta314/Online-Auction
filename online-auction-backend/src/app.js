import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { EventEmitter } from 'events'
EventEmitter.defaultMaxListeners = 30


// Routes
import authRoutes from './routes/auth.routes.js'
import productRoutes from './routes/product.routes.js'
import sellerRoutes from './routes/seller.routes.js'
import adminRoutes from './routes/admin.routes.js'
import notificationRoutes from './routes/notification.routes.js'
import categoryRoutes from './routes/category.routes.js'
import packageRoutes from './routes/package.routes.js'
import userRoutes from './routes/user.routes.js'
import bidRoutes from './routes/bid.routes.js'
import paymentRoutes from './routes/payment.routes.js'
import webhookRoutes from './routes/webhook.routes.js'
import realtimeRoutes from './routes/realtime.routes.js'


// Middlewares
import authMiddleware from './middleware/auth.middleware.js'


dotenv.config()

const app = express()

// Enable CORS + JSON
app.use(cors())

// For regular API routes
app.use((req, res, next) => {
  if (req.originalUrl === '/api/webhooks/stripe') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// 🔍 Debug: log every incoming request
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`)
  next()
})

// 🆓 Public routes
app.use('/api/auth', authRoutes)

// Webhook routes (need to be before JSON middleware for raw body)
app.use('/api/webhooks', webhookRoutes)

// 🔐 Protected routes (require JWT)
app.use('/api/products', productRoutes)

app.use('/api/seller', sellerRoutes)

app.use('/api/categories', categoryRoutes)

app.use('/api/packages', packageRoutes)

app.use('/api/users', userRoutes)

app.use('/api/bids', bidRoutes)

app.use('/api/admin', adminRoutes)

app.use('/api/notifications', notificationRoutes)

app.use('/api/payments', paymentRoutes)

// 🔄 Real-time routes
app.use('/api/realtime', realtimeRoutes)


// Basic test route
app.get('/', (_, res) => res.send('API is running'))

export default app
