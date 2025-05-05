import app from './app.js'
import dotenv from 'dotenv'
import { initScheduler } from './scheduler.js'
import emailService from './utils/emailService.js'

dotenv.config()

const PORT = process.env.PORT || 5001

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  
  // Initialize email service
  emailService.initializeTransporter()
    .then(() => console.log('📧 Email service initialized'))
    .catch(err => console.error('Failed to initialize email service:', err))
  
  // Initialize scheduler
  initScheduler()
}) 