import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Reset a specific auction by ID to make it live again with next year's end date
 * Usage: node reset-auction-by-id.js PRODUCT_ID
 */
async function resetAuctionById() {
  try {
    // Get the product ID from command line arguments
    const args = process.argv.slice(2);
    if (args.length === 0) {
      console.error('Error: Please provide a product ID to reset');
      console.log('Usage: node reset-auction-by-id.js PRODUCT_ID');
      process.exit(1);
    }

    const productId = parseInt(args[0], 10);
    if (isNaN(productId)) {
      console.error('Error: Product ID must be a valid number');
      process.exit(1);
    }

    // Get current date
    const now = new Date();
    
    // Calculate next year's date
    const nextYear = new Date();
    nextYear.setFullYear(now.getFullYear() + 1);
    
    // Find the product
    const product = await prisma.product.findUnique({
      where: {
        id: productId
      }
    });
    
    if (!product) {
      console.error(`Error: Product with ID ${productId} not found`);
      process.exit(1);
    }
    
    console.log(`Found product: "${product.name}" (ID: ${product.id})`);
    console.log(`Current status: Start: ${product.startTime.toISOString()}, End: ${product.endTime.toISOString()}`);
    console.log(`Processed: ${product.processed}, Payment Received: ${product.paymentReceived}`);
    
    // Set new start time to now
    const newStartTime = new Date();
    
    // Set new end time to one year from now
    const newEndTime = new Date(nextYear);
    
    // Reset the auction status
    await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        startTime: newStartTime,
        endTime: newEndTime,
        processed: false,
        paymentReceived: false
      }
    });
    
    console.log('\nAuction has been reset successfully:');
    console.log(`New start time: ${newStartTime.toISOString()}`);
    console.log(`New end time: ${newEndTime.toISOString()}`);
    console.log('Processed and payment status reset to false');
    
  } catch (error) {
    console.error('Error resetting auction:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
resetAuctionById()
  .then(() => console.log('Auction reset process completed.'))
  .catch(err => console.error('Fatal error:', err)); 