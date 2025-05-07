import app from './app.js'
import http from 'http'
import dotenv from 'dotenv'
import { initScheduler } from './scheduler.js'
import emailService from './utils/emailService.js'
import socketService from './utils/socketService.js'

dotenv.config()

const PORT = process.env.PORT || 5001

// Create HTTP server
const server = http.createServer(app)

// Initialize Socket.IO
socketService.initializeSocketIO(server)

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  
  // Initialize email service
  emailService.initializeTransporter()
    .then(() => console.log('📧 Email service initialized'))
    .catch(err => console.error('Failed to initialize email service:', err))
  
  // Initialize scheduler
  initScheduler()
  
  console.log('🔌 Real-time bidding system activated')
}) 