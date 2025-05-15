import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addNewProduct() {
  console.log('Adding new test product with next year end time...');
  
  // Get the current date
  const now = new Date();
  
  // Create end date for next year
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);
  
  try {
    // First, check if we have at least one seller user
    let seller = await prisma.user.findFirst({
      where: { role: 'SELLER' }
    });
    
    if (!seller) {
      console.log('No seller found. Creating a seller user...');
      
      // Create a seller user if none exists
      seller = await prisma.user.create({
        data: {
          username: `seller_${Math.floor(Math.random() * 10000)}`,
          email: `seller_${Math.floor(Math.random() * 10000)}@example.com`,
          password: '$2b$10$EpRnTzVlqHNP0.fUbXUwSOyuiXe/QLSUG6xNekdHgTGmrpHEfIoxm', // 'password' hashed
          role: 'SELLER'
        }
      });
      
      console.log('Created new seller:', seller);
    }
    
    // Check if we have at least one category
    let category = await prisma.category.findFirst();
    
    if (!category) {
      console.log('No category found. Creating a category...');
      
      // Create a category if none exists
      category = await prisma.category.create({
        data: {
          name: 'Electronics'
        }
      });
      
      console.log('Created new category:', category);
    }
    
    // Create several new products with next year end time
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "New MacBook Pro 16 (Live Auction)",
          description: "Brand new MacBook Pro with M3 chip, 16-inch display, 32GB RAM and 1TB SSD",
          photoUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3",
          minBidPrice: 149000,
          startTime: now,
          endTime: nextYear,
          sellerId: seller.id,
          categoryId: category.id
        }
      }),
      prisma.product.create({
        data: {
          name: "iPhone 15 Pro Max (Live Auction)",
          description: "Latest iPhone with A17 chip, 256GB storage, and advanced camera system",
          photoUrl: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
          minBidPrice: 99000,
          startTime: now,
          endTime: nextYear,
          sellerId: seller.id,
          categoryId: category.id
        }
      }),
      prisma.product.create({
        data: {
          name: "Sony Alpha A7 IV Camera",
          description: "Professional mirrorless camera with 33MP full-frame sensor and 4K video recording",
          photoUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.0.3",
          minBidPrice: 189000,
          startTime: now,
          endTime: nextYear,
          sellerId: seller.id,
          categoryId: category.id
        }
      })
    ]);
    
    console.log('Added new products:', products);
  } catch (error) {
    console.error('Error adding products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
addNewProduct()
  .then(() => console.log('Done!'))
  .catch(error => {
    console.error('Error in script execution:', error);
    process.exit(1);
  }); 