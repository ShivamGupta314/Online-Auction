import app from './src/app.js'
import dotenv from 'dotenv'
import logger from './src/utils/logger.js'
import { prisma } from './src/prismaClient.js'
dotenv.config()

const PORT = process.env.PORT || 5000

// Start the server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Server running at http://localhost:${PORT}`)
})

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  logger.info(`${signal} signal received: closing HTTP server`)
  
  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed')
    
    // Close database connections
    try {
      await prisma.$disconnect()
      logger.info('Database connections closed')
      process.exit(0)
    } catch (error) {
      logger.error(`Error during database disconnect: ${error.message}`)
      process.exit(1)
    }
  })
  
  // Force close if graceful shutdown fails after 10s
  setTimeout(() => {
    logger.error('Forcing server shutdown after timeout')
    process.exit(1)
  }, 10000)
}

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
})

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error(`Uncaught Exception: ${error.message}`)
  logger.error(error.stack)
  process.exit(1)
})
