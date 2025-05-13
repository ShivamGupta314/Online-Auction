#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import https from 'https';

dotenv.config();

const prisma = new PrismaClient();

/**
 * Auction Management Tool
 * 
 * Usage:
 *   node auction-manager.js list                 - List all products
 *   node auction-manager.js reset-all            - Reset all ended auctions
 *   node auction-manager.js reset <id>           - Reset a specific auction by ID
 *   node auction-manager.js create-sample        - Create a sample ended auction
 *   node auction-manager.js fix-images           - Fix product images
 *   node auction-manager.js download-images      - Download sample product images
 */

// Main function
async function main() {
  try {
    const args = process.argv.slice(2);
    const command = args[0] || 'help';

    switch(command) {
      case 'list':
        await listProducts();
        break;
      case 'reset-all':
        await resetEndedAuctions();
        break;
      case 'reset':
        if (!args[1]) {
          console.error('Error: Please provide a product ID to reset');
          console.log('Usage: node auction-manager.js reset <id>');
          process.exit(1);
        }
        await resetAuctionById(parseInt(args[1], 10));
        break;
      case 'create-sample':
        await createSampleProduct();
        break;
      case 'fix-images':
        await fixProductImages();
        break;
      case 'download-images':
        await downloadSampleImages();
        break;
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Show help information
 */
function showHelp() {
  console.log('\nAuction Management Tool');
  console.log('======================\n');
  console.log('Commands:');
  console.log('  node auction-manager.js list                 - List all products');
  console.log('  node auction-manager.js reset-all            - Reset all ended auctions');
  console.log('  node auction-manager.js reset <id>           - Reset a specific auction by ID');
  console.log('  node auction-manager.js create-sample        - Create a sample ended auction');
  console.log('  node auction-manager.js fix-images           - Fix product images');
  console.log('  node auction-manager.js download-images      - Download sample product images');
  console.log('  node auction-manager.js help                 - Show this help');
}

/**
 * List all products in the database with their status
 */
async function listProducts() {
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
    console.log(`Image: ${product.photoUrl}`);
    console.log(`Start: ${product.startTime.toISOString()}`);
    console.log(`End: ${product.endTime.toISOString()}`);
    console.log(`Processed: ${product.processed} | Payment Received: ${product.paymentReceived}`);
    console.log(`Seller ID: ${product.sellerId} | Category ID: ${product.categoryId}`);
    console.log('-'.repeat(80) + '\n');
  });
}

/**
 * Reset ended auctions to make them live again with next year's end date
 */
async function resetEndedAuctions() {
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
}

/**
 * Reset a specific auction by ID to make it live again with next year's end date
 */
async function resetAuctionById(productId) {
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
  console.log(`Image URL: ${product.photoUrl}`);
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
}

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
  
  // Start date: 30 days ago in the past
  const startDate = new Date();
  startDate.setFullYear(now.getFullYear() - 1);
  startDate.setMonth(now.getMonth());
  startDate.setDate(now.getDate() - 30);
  
  // End date: 20 days ago in the past
  const endDate = new Date();
  endDate.setFullYear(now.getFullYear() - 1);
  endDate.setMonth(now.getMonth());
  endDate.setDate(now.getDate() - 20);
  
  console.log(`Creating product with end date: ${endDate.toISOString()} (in the past)`);
  
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
  console.log(`node auction-manager.js reset ${product.id}`);
}

/**
 * Update product images with proper URLs based on category
 */
async function fixProductImages() {
  // First ensure the directory structure exists
  await createDirectoryStructure();
  
  // Get all products
  const products = await prisma.product.findMany({
    include: {
      category: true
    }
  });
  
  if (products.length === 0) {
    console.log('No products found in the database.');
    return;
  }
  
  console.log(`Found ${products.length} products. Updating image URLs...`);
  
  // Update each product
  for (const product of products) {
    // Skip products that already have valid image paths
    if (product.photoUrl && 
        product.photoUrl.startsWith('/images/products/') && 
        !product.photoUrl.includes('example.com')) {
      console.log(`Product ID ${product.id} already has a valid image URL: ${product.photoUrl}`);
      continue;
    }
    
    // Get appropriate image URL based on category
    const newImageUrl = getImageUrlForCategory(product.category.name);
    
    // Update the product
    await prisma.product.update({
      where: {
        id: product.id
      },
      data: {
        photoUrl: newImageUrl
      }
    });
    
    console.log(`Updated product ID ${product.id}: "${product.name}" - New image URL: ${newImageUrl}`);
  }
  
  console.log(`\nImage update completed for ${products.length} products.`);
  console.log('Note: The front-end should reference these images using the base API URL.');
  console.log('For example: http://localhost:5000/uploads/images/products/electronics/laptop.jpg');
}

/**
 * Creates the uploads directory structure if it doesn't exist
 */
async function createDirectoryStructure() {
  console.log('Checking directory structure...');
  
  // Define base uploads path
  const uploadsBase = path.join(process.cwd(), 'uploads');
  
  // Create the uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsBase)) {
    fs.mkdirSync(uploadsBase, { recursive: true });
    console.log('Created uploads directory');
  }
  
  // Create product images directory if it doesn't exist
  const productsDir = path.join(uploadsBase, 'images', 'products');
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
    console.log('Created products images directory');
  }
  
  // Create category subdirectories
  const categories = ['electronics', 'fashion', 'home', 'art', 'default'];
  for (const category of categories) {
    const categoryDir = path.join(productsDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
      console.log(`Created ${category} category directory`);
    }
  }
  
  console.log('Directory structure check completed.');
}

/**
 * Download placeholder images for product categories
 */
async function downloadSampleImages() {
  // Category structure
  const categories = {
    'electronics': ['laptop', 'smartphone', 'headphones', 'tablet', 'camera'],
    'fashion': ['jacket', 'shoes', 'watch', 'sunglasses', 'bag'],
    'home': ['sofa', 'table', 'lamp', 'chair', 'rug'],
    'art': ['painting', 'sculpture', 'print', 'photograph', 'pottery'],
    'default': ['item1', 'item2', 'item3', 'item4', 'item5']
  };
  
  // Create directory structure
  await createDirectoryStructure();
  
  // Download images for each category
  const downloadPromises = [];
  
  console.log('Starting image downloads...');
  
  for (const category in categories) {
    for (const item of categories[category]) {
      // Add small delay between downloads to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 100));
      downloadPromises.push(downloadImage(category, item));
    }
  }
  
  // Wait for all downloads to complete
  await Promise.all(downloadPromises);
  
  console.log('\nAll images downloaded successfully!');
  console.log(`Total images: ${Object.values(categories).flat().length}`);
}

/**
 * Download a placeholder image
 */
function downloadImage(category, item) {
  return new Promise((resolve, reject) => {
    // Skip download if file already exists
    const savePath = path.join(
      process.cwd(), 
      'uploads', 
      'images', 
      'products', 
      category, 
      `${item}.jpg`
    );
    
    if (fs.existsSync(savePath)) {
      console.log(`File already exists: ${category}/${item}.jpg - Skipping`);
      resolve();
      return;
    }
    
    // Create placeholder image URL - using placeholder.com service
    const width = 500;
    const height = 500;
    const imageUrl = `https://via.placeholder.com/${width}x${height}.jpg?text=${category}+${item}`;
    
    // Create write stream
    const file = fs.createWriteStream(savePath);
    
    // Download the image
    https.get(imageUrl, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${category}/${item}.jpg`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(savePath, () => {}); // Delete the file if there's an error
      console.error(`Error downloading ${category}/${item}.jpg:`, err.message);
      reject(err);
    });
  });
}

// Run the main function
main()
  .then(() => console.log('\nOperation completed successfully.'))
  .catch(err => console.error('Fatal error:', err)); 