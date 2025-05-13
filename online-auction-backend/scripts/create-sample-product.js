import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Get appropriate image URL for a product based on its category
 */
function getImageUrlForCategory(categoryName) {
  // Map of category names to image directories
  const categoryImageMap = {
    'Electronics': 'electronics',
    'Fashion': 'fashion',
    'Home': 'home',
    'Art': 'art'
  };
  
  // Get directory name for this category, or use default
  const imageDir = categoryImageMap[categoryName] || 'default';
  
  // Image names for each category
  const imageOptions = {
    'electronics': ['laptop', 'smartphone', 'headphones', 'tablet', 'camera'],
    'fashion': ['jacket', 'shoes', 'watch', 'sunglasses', 'bag'],
    'home': ['sofa', 'table', 'lamp', 'chair', 'rug'],
    'art': ['painting', 'sculpture', 'print', 'photograph', 'pottery'],
    'default': ['item1', 'item2', 'item3', 'item4', 'item5']
  };
  
  // Select a random image from the appropriate category
  const images = imageOptions[imageDir];
  const imageName = images[Math.floor(Math.random() * images.length)];
  
  // Form the full path
  return `/images/products/${imageDir}/${imageName}.jpg`;
}

/**
 * Create a sample auction product with an ended status
 */
async function createSampleProduct() {
  try {
    // Check if we have any users and categories
    const userCount = await prisma.user.count();
    const categoryCount = await prisma.category.count();
    
    if (userCount === 0) {
      console.log('Creating a sample user first...');
      await prisma.user.create({
        data: {
          username: 'sampleuser',
          email: 'sample@example.com',
          password: '$2a$10$dJmrko1Tz9ab62SeMTgAAOCoJfRu7GJ5Jl4BIsmDnHDJqV9sxZmPi', // hashed 'password123'
          role: 'SELLER'
        }
      });
      console.log('Sample user created successfully.');
    }
    
    if (categoryCount === 0) {
      console.log('Creating a sample category first...');
      await prisma.category.create({
        data: {
          name: 'Electronics'
        }
      });
      console.log('Sample category created successfully.');
    }
    
    // Get the first user and category
    const user = await prisma.user.findFirst();
    const category = await prisma.category.findFirst();
    
    if (!user || !category) {
      console.error('Failed to retrieve user or category');
      return;
    }
    
    // Get appropriate image URL for the product category
    const imageUrl = getImageUrlForCategory(category.name);
    
    // Check if the uploads directory exists, create it if it doesn't
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      console.log('Creating uploads directory...');
      fs.mkdirSync(uploadsDir, { recursive: true });
      
      // Create subdirectories for product images
      fs.mkdirSync(path.join(uploadsDir, 'images', 'products', 'default'), { recursive: true });
    }
    
    // Calculate dates - force them to be in the actual past
    const now = new Date();
    
    // Start date: 30 days ago in the ACTUAL past year
    const startDate = new Date();
    startDate.setFullYear(now.getFullYear() - 1);
    startDate.setMonth(now.getMonth());
    startDate.setDate(now.getDate() - 30);
    
    // End date: 20 days ago in the ACTUAL past year
    const endDate = new Date();
    endDate.setFullYear(now.getFullYear() - 1);
    endDate.setMonth(now.getMonth());
    endDate.setDate(now.getDate() - 20);
    
    console.log(`Creating product with end date: ${endDate.toISOString()} (definitely in the past)`);
    
    // Create the sample product with ended auction
    const product = await prisma.product.create({
      data: {
        name: 'Sample Ended Auction Product',
        description: 'This is a sample product created for testing auction reset functionality.',
        photoUrl: imageUrl,
        minBidPrice: 99.99,
        startTime: startDate,
        endTime: endDate,
        sellerId: user.id,
        categoryId: category.id,
        processed: false,
        paymentReceived: false
      }
    });
    
    console.log('\nSample product created successfully:');
    console.log(`ID: ${product.id} | Name: ${product.name}`);
    console.log(`Price: $${product.minBidPrice}`);
    console.log(`Image URL: ${product.photoUrl}`);
    console.log(`Start: ${product.startTime.toISOString()}`);
    console.log(`End: ${product.endTime.toISOString()} (Should be in the past)`);
    console.log(`Seller ID: ${product.sellerId} | Category ID: ${product.categoryId}`);
    console.log('\nYou can now reset this auction using:');
    console.log(`node scripts/reset-auction-by-id.js ${product.id}`);
    
  } catch (error) {
    console.error('Error creating sample product:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
createSampleProduct()
  .then(() => console.log('Sample product creation completed.'))
  .catch(err => console.error('Fatal error:', err)); 