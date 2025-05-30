import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import compression from 'compression'
import { EventEmitter } from 'events'
import logger from './utils/logger.js'
import cacheService from './utils/cacheService.js'
import path from 'path'
import { fileURLToPath } from 'url'
EventEmitter.defaultMaxListeners = 30

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

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
import healthRoutes from './routes/health.routes.js'


// Middlewares
import authMiddleware from './middleware/auth.middleware.js'


dotenv.config()

const app = express()

// Initialize Redis if enabled
if (process.env.ENABLE_REDIS === 'true') {
  cacheService.initRedisClient()
    .then(() => logger.info('Redis initialized'))
    .catch(err => logger.error(`Redis initialization failed: ${err.message}`));
}

// Enable CORS + JSON
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'], // Allow frontend domains
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
}))

// Add security headers but disable contentSecurityPolicy for local development
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false
}))

// Add compression
app.use(compression())

// Serve static files from uploads directory with CORS headers
app.use('/uploads', (req, res, next) => {
  res.set({
    'Cross-Origin-Resource-Policy': 'cross-origin',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Cross-Origin-Embedder-Policy': 'unsafe-none'
  });
  next();
}, express.static(path.join(rootDir, 'uploads')));
logger.info(`Static files from ${path.join(rootDir, 'uploads')} will be served at /uploads`);

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply rate limiting to all routes
app.use(apiLimiter);

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts, please try again after an hour'
});

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
  logger.http(`[${req.method}] ${req.url}`)
  next()
})

// API ROUTES INDEX
// =================
// 1. Public Authentication Routes:     /api/auth
// 2. User-specific Routes:             /api/users
// 3. Product/Auction Routes:           /api/products
// 4. Bidding Routes:                   /api/bids
// 5. Category Routes:                  /api/categories
// 6. Seller-specific Routes:           /api/seller
// 7. Package/Subscription Routes:      /api/packages
// 8. Payment Routes:                   /api/payments
// 9. Admin Routes:                     /api/admin
// 10. Notification Routes:             /api/notifications
// 11. Webhook Routes:                  /api/webhooks
// 12. Real-time Routes:                /api/realtime
// 13. Health Check Routes:             /api/health

// 🆓 Public routes
app.use('/api/auth', authLimiter, authRoutes)

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

// 🩺 Health check routes
app.use('/api/health', healthRoutes)

// Basic test route
app.get('/', (_, res) => res.send('API is running'))

export default app
