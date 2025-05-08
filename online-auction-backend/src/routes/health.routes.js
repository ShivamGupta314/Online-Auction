import express from 'express'
import { prisma } from '../prismaClient.js'
import logger from '../utils/logger.js'

const router = express.Router()

// Simple health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    nodeEnv: process.env.NODE_ENV
  })
})

// Database health check
router.get('/db', async (req, res) => {
  try {
    // If we're in test mode with mocks, we don't check the database
    if (process.env.NODE_ENV === 'test' && process.env.USE_TEST_MOCKS === 'true') {
      return res.status(200).json({
        status: 'ok',
        message: 'Database connection is working',
        usingMocks: true,
        timestamp: new Date().toISOString()
      })
    }
    
    // Try to query the database
    await prisma.$queryRaw`SELECT 1`
    
    return res.status(200).json({
      status: 'ok',
      message: 'Database connection is working',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database health check failed:', error)
    
    return res.status(500).json({
      status: 'error',
      message: 'Database connection error',
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

export default router 