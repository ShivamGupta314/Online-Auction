import cron from 'node-cron'
import auctionService from './services/auction.service.js'
import { prisma } from './prismaClient.js'

// Initialize all scheduled jobs
export const initScheduler = () => {
  console.log('🕙 Initializing scheduler...')

  // Process ended auctions every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    try {
      console.log('Running scheduled task: Process ended auctions')
      const result = await auctionService.processEndedAuctions()
      
      if (result.success) {
        console.log(`Processed ${result.processed} ended auctions`)
      } else {
        console.error('Failed to process ended auctions:', result.error)
      }
    } catch (error) {
      console.error('Error in auction processing job:', error)
    }
  })

  // Send reminders for auctions ending within 24 hours (runs at 9 AM daily)
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('Running scheduled task: Send auction ending reminders')
      const endingSoonAuctions = await auctionService.getEndingSoonAuctions(24)
      
      console.log(`Found ${endingSoonAuctions.length} auctions ending soon`)
      
      // Future implementation to send reminders to bidders and potential bidders
      // This could integrate with a more sophisticated notification system
      
    } catch (error) {
      console.error('Error in auction reminder job:', error)
    }
  })

  // Example of how to handle application shutdown
  process.on('SIGTERM', async () => {
    console.log('Shutting down scheduler gracefully...')
    await prisma.$disconnect()
    process.exit(0)
  })
  
  console.log('✅ Scheduler initialized')
}

export default { initScheduler } 