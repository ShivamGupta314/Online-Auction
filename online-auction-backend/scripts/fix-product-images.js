import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();

// Sample image URLs for different product categories
const categoryImages = {
  'Electronics': [
    '/images/products/electronics/laptop.jpg',
    '/images/products/electronics/smartphone.jpg',
    '/images/products/electronics/headphones.jpg',
    '/images/products/electronics/tablet.jpg',
    '/images/products/electronics/camera.jpg'
  ],
  'Fashion': [
    '/images/products/fashion/jacket.jpg',
    '/images/products/fashion/shoes.jpg',
    '/images/products/fashion/watch.jpg',
    '/images/products/fashion/sunglasses.jpg',
    '/images/products/fashion/bag.jpg'
  ],
  'Home': [
    '/images/products/home/sofa.jpg',
    '/images/products/home/table.jpg',
    '/images/products/home/lamp.jpg',
    '/images/products/home/chair.jpg',
    '/images/products/home/rug.jpg'
  ],
  'Art': [
    '/images/products/art/painting.jpg',
    '/images/products/art/sculpture.jpg',
    '/images/products/art/print.jpg',
    '/images/products/art/photograph.jpg',
    '/images/products/art/pottery.jpg'
  ]
};

// Default images for any category
const defaultImages = [
  '/images/products/default/item1.jpg',
  '/images/products/default/item2.jpg',
  '/images/products/default/item3.jpg',
  '/images/products/default/item4.jpg',
  '/images/products/default/item5.jpg'
];

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
 * Get appropriate image URL for a product based on its category
 */
function getImageUrlForProduct(categoryName) {
  // Normalize category name
  const normalizedCategory = categoryName.charAt(0).toUpperCase() + categoryName.slice(1).toLowerCase();
  
  // Get images array for this category, or use default
  const imagesArray = categoryImages[normalizedCategory] || defaultImages;
  
  // Return a random image from the array
  return imagesArray[Math.floor(Math.random() * imagesArray.length)];
}

/**
 * Update product images with proper URLs based on category
 */
async function fixProductImages() {
  try {
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
      if (product.photoUrl && !product.photoUrl.includes('example.com')) {
        console.log(`Product ID ${product.id} already has a valid image URL: ${product.photoUrl}`);
        continue;
      }
      
      // Get appropriate image URL based on category
      const newImageUrl = getImageUrlForProduct(product.category.name);
      
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
    
  } catch (error) {
    console.error('Error fixing product images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
fixProductImages()
  .then(() => console.log('Product image fixing process completed.'))
  .catch(err => console.error('Fatal error:', err)); 