import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

/**
 * List all products in the database with their status
 */
async function listProducts() {
  try {
    // Get all products
    const products = await prisma.product.findMany({
      orderBy: {
        id: 'asc'
      }
    });
    
    if (products.length === 0) {
      console.log('No products found in the database.');
      return;
    }
    
    console.log(`Found ${products.length} products in the database:\n`);
    
    const now = new Date();
    
    // Display product information
    products.forEach(product => {
      const isEnded = product.endTime < now;
      const status = isEnded ? 'ENDED' : 'ACTIVE';
      const statusStyle = isEnded ? '\x1b[31m' : '\x1b[32m'; // Red for ended, green for active
      
      console.log(`ID: ${product.id} | Name: ${product.name}`);
      console.log(`Price: $${product.minBidPrice} | Status: ${statusStyle}${status}\x1b[0m`);
      console.log(`Start: ${product.startTime.toISOString()}`);
      console.log(`End: ${product.endTime.toISOString()}`);
      console.log(`Processed: ${product.processed} | Payment Received: ${product.paymentReceived}`);
      console.log(`Seller ID: ${product.sellerId} | Category ID: ${product.categoryId}`);
      console.log('-'.repeat(80) + '\n');
    });
    
  } catch (error) {
    console.error('Error listing products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
listProducts()
  .then(() => console.log('Product listing completed.'))
  .catch(err => console.error('Fatal error:', err)); 