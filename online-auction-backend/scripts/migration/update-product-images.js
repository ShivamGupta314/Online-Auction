#!/usr/bin/env node
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure environment variables
dotenv.config();

// Create Prisma client
const prisma = new PrismaClient();

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

/**
 * Database Migration: Ensure all products have proper image URLs
 * Use this script when deploying or migrating to ensure product images are properly set
 */

// Category image mapping
const categoryImageMap = {
  'Electronics': 'electronics',
  'Fashion': 'fashion',
  'Home': 'home',
  'Art': 'art'
};

// Image options for each category
const imageOptions = {
  'electronics': ['laptop', 'smartphone', 'headphones', 'tablet', 'camera'],
  'fashion': ['jacket', 'shoes', 'watch', 'sunglasses', 'bag'],
  'home': ['sofa', 'table', 'lamp', 'chair', 'rug'],
  'art': ['painting', 'sculpture', 'print', 'photograph', 'pottery'],
  'default': ['item1', 'item2', 'item3', 'item4', 'item5']
};

/**
 * Get appropriate image URL for a product category
 */
function getImageUrlForCategory(categoryName) {
  // Normalize category name
  const normalizedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
  
  // Get directory name for this category, or use default
  const imageDir = categoryImageMap[normalizedCategory] || 'default';
  
  // Select a random image from the appropriate category
  const images = imageOptions[imageDir];
  const imageName = images[Math.floor(Math.random() * images.length)];
  
  // Form the full path
  return `/images/products/${imageDir}/${imageName}.jpg`;
}

/**
 * Check and create directory structure for image storage
 */
async function ensureDirectoryStructure() {
  console.log('Checking image directory structure...');
  
  // Create base uploads directory
  const uploadsBase = path.join(rootDir, 'uploads');
  if (!fs.existsSync(uploadsBase)) {
    fs.mkdirSync(uploadsBase, { recursive: true });
    console.log('Created uploads directory');
  }
  
  // Create products directory
  const productsDir = path.join(uploadsBase, 'images', 'products');
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
    console.log('Created products images directory');
  }
  
  // Create category directories
  const categories = ['electronics', 'fashion', 'home', 'art', 'default'];
  for (const category of categories) {
    const categoryDir = path.join(productsDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
      console.log(`Created ${category} category directory`);
    }
  }
  
  console.log('Directory structure verification complete');
}

/**
 * Check if image files exist, create placeholder if needed
 */
async function ensureImageFiles() {
  console.log('Checking if image files exist...');
  
  // This is a minimal 1x1 pixel JPG image data (placeholder)
  const minimalJpg = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48, 
    0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12, 
    0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20, 
    0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 
    0x39, 0x3d, 0x38, 0x32, 0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xdb, 0x00, 0x43, 0x01, 0x09, 0x09, 
    0x09, 0x0c, 0x0b, 0x0c, 0x18, 0x0d, 0x0d, 0x18, 0x32, 0x21, 0x1c, 0x21, 0x32, 0x32, 0x32, 0x32, 
    0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 
    0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 
    0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0x32, 0xff, 0xc0, 0x00, 
    0x11, 0x08, 0x00, 0x01, 0x00, 0x01, 0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 
    0xff, 0xc4, 0x00, 0x15, 0x00, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xff, 0xc4, 0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xc4, 0x00, 
    0x14, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0xff, 0xc4, 0x00, 0x14, 0x11, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 
    0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x0c, 0x03, 0x01, 0x00, 
    0x02, 0x11, 0x03, 0x11, 0x00, 0x3f, 0x00, 0xb2, 0xc0, 0x07, 0xff, 0xd9
  ]);
  
  // Check and create placeholder images for each category
  for (const category in imageOptions) {
    for (const image of imageOptions[category]) {
      const imagePath = path.join(rootDir, 'uploads', 'images', 'products', category, `${image}.jpg`);
      
      if (!fs.existsSync(imagePath)) {
        fs.writeFileSync(imagePath, minimalJpg);
        console.log(`Created placeholder image: ${category}/${image}.jpg`);
      }
    }
  }
  
  console.log('Image file verification complete');
}

/**
 * Update all products with valid image URLs
 */
async function updateProductImages() {
  console.log('Updating product images...');
  
  // Get all products with their categories
  const products = await prisma.product.findMany({
    include: {
      category: true
    }
  });
  
  console.log(`Found ${products.length} products in the database`);
  
  // Update count
  let updatedCount = 0;
  
  // Check and update each product
  for (const product of products) {
    // Skip products that already have valid image paths
    if (product.photoUrl && 
        product.photoUrl.startsWith('/images/products/') && 
        !product.photoUrl.includes('example.com')) {
      continue;
    }
    
    // Get a new image URL based on the product's category
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
    
    updatedCount++;
    console.log(`Updated product ID ${product.id}: "${product.name}" - Image URL: ${newImageUrl}`);
  }
  
  console.log(`Updated ${updatedCount} products with new image URLs`);
}

/**
 * Main migration function
 */
async function migrateProductImages() {
  try {
    console.log('Starting product image migration...');
    
    // Step 1: Ensure directory structure
    await ensureDirectoryStructure();
    
    // Step 2: Ensure image files exist
    await ensureImageFiles();
    
    // Step 3: Update product database records
    await updateProductImages();
    
    console.log('Product image migration completed successfully!');
    
  } catch (error) {
    console.error('Error during product image migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateProductImages()
  .then(() => console.log('Migration script execution completed.'))
  .catch(err => console.error('Fatal error during migration:', err)); 