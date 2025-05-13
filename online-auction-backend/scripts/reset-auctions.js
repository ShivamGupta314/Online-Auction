import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Reset ended auctions to make them live again with next year's end date
 */
async function resetEndedAuctions() {
  try {
    // Get current date
    const now = new Date();
    
    // Calculate next year's date
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 1);
    
    // Find all ended auction products
    const endedProducts = await prisma.product.findMany({
      where: {
        endTime: {
          lt: now
        }
      }
    });
    
    console.log(`Found ${endedProducts.length} ended auction products`);
    
    if (endedProducts.length === 0) {
      console.log('No ended auctions found to reset.');
      return;
    }
    
    // Update each product
    for (const product of endedProducts) {
      // Set new start time to now
      const newStartTime = new Date();
      
      // Set new end time to the same month/day but next year
      const newEndTime = new Date(nextYear);
      newEndTime.setMonth(product.endTime.getMonth());
      newEndTime.setDate(product.endTime.getDate());
      
      // Make sure end time is at least 7 days from now
      const minEndTime = new Date();
      minEndTime.setDate(now.getDate() + 7);
      if (newEndTime < minEndTime) {
        newEndTime.setDate(now.getDate() + 7);
      }
      
      // Reset the auction status
      await prisma.product.update({
        where: {
          id: product.id
        },
        data: {
          startTime: newStartTime,
          endTime: newEndTime,
          processed: false,
          paymentReceived: false
        }
      });
      
      console.log(`Reset auction ID ${product.id}: "${product.name}" - New end date: ${newEndTime.toISOString()}`);
    }
    
    console.log(`Successfully reset ${endedProducts.length} auction products.`);
    console.log('New end dates are set to next year.');
    
  } catch (error) {
    console.error('Error resetting auctions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
resetEndedAuctions()
  .then(() => console.log('Auction reset process completed.'))
  .catch(err => console.error('Fatal error:', err)); 