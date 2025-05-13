import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script to download placeholder images for product categories
 */

// Category structure
const categories = {
  'electronics': ['laptop', 'smartphone', 'headphones', 'tablet', 'camera'],
  'fashion': ['jacket', 'shoes', 'watch', 'sunglasses', 'bag'],
  'home': ['sofa', 'table', 'lamp', 'chair', 'rug'],
  'art': ['painting', 'sculpture', 'print', 'photograph', 'pottery'],
  'default': ['item1', 'item2', 'item3', 'item4', 'item5']
};

// Create directory structure
function createDirectories() {
  console.log('Creating directory structure...');
  
  // Base uploads path
  const uploadsBase = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsBase)) {
    fs.mkdirSync(uploadsBase, { recursive: true });
  }
  
  // Products directory
  const productsDir = path.join(uploadsBase, 'images', 'products');
  if (!fs.existsSync(productsDir)) {
    fs.mkdirSync(productsDir, { recursive: true });
  }
  
  // Category directories
  for (const category in categories) {
    const categoryDir = path.join(productsDir, category);
    if (!fs.existsSync(categoryDir)) {
      fs.mkdirSync(categoryDir, { recursive: true });
    }
  }
  
  console.log('Directory structure created successfully.');
}

// Download a placeholder image
function downloadImage(category, item, index) {
  return new Promise((resolve, reject) => {
    // Create placeholder image URL - using placeholder.com service
    const width = 500;
    const height = 500;
    const imageUrl = `https://via.placeholder.com/${width}x${height}.jpg?text=${category}+${item}`;
    
    // Define the save path
    const savePath = path.join(
      process.cwd(), 
      'uploads', 
      'images', 
      'products', 
      category, 
      `${item}.jpg`
    );
    
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

// Main function to download all images
async function downloadAllImages() {
  try {
    // Create directory structure
    createDirectories();
    
    // Download images for each category
    const downloadPromises = [];
    
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
    
  } catch (error) {
    console.error('Error downloading images:', error);
  }
}

// Execute the download
downloadAllImages()
  .then(() => console.log('Image download process completed.'))
  .catch(err => console.error('Fatal error:', err)); 