import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting DB seed...')

  // ✅ Clear data in the right order
  await prisma.userPackage.deleteMany()
  await prisma.bid.deleteMany()
  await prisma.product.deleteMany()
  await prisma.user.deleteMany()
  await prisma.category.deleteMany()
  await prisma.package.deleteMany()

  // Create categories if they don't exist
  const categories = [
    { name: 'Electronics' },
    { name: 'Home Appliances' },
    { name: 'Fashion' },
    { name: 'Books' },
    { name: 'Toys & Games' }
  ]

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: category
    })
  }

  // Create a seller user if it doesn't exist
  const seller = await prisma.user.upsert({
    where: { email: 'seller@example.com' },
    update: {},
    create: {
      email: 'seller@example.com',
      username: 'demo_seller',
      password: '$2a$10$GqBuWqBW7RP9G.6TRiKCB.LHYVhNhIqoNwLieZIUsDvIgbNFxjcXe', // password: password123
      role: 'SELLER'
    }
  })

  // Create a bidder user if it doesn't exist
  const bidder = await prisma.user.upsert({
    where: { email: 'bidder@example.com' },
    update: {},
    create: {
      email: 'bidder@example.com',
      username: 'demo_bidder',
      password: '$2a$10$GqBuWqBW7RP9G.6TRiKCB.LHYVhNhIqoNwLieZIUsDvIgbNFxjcXe', // password: password123
      role: 'BIDDER'
    }
  })

  // Get category IDs
  const electronicsCategory = await prisma.category.findUnique({
    where: { name: 'Electronics' }
  })

  // Sample live auctions
  const liveAuctions = [
    {
      name: 'Apple iPhone 15 Pro Max (256GB)',
      description: 'Brand new, sealed in box. Latest model with advanced camera system and A17 Pro chip.',
      photoUrl: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      minBidPrice: 149900.00,
      startTime: new Date(Date.now() - 86400000), // 1 day ago
      endTime: new Date(Date.now() + 7200000), // 2 hours from now
      sellerId: seller.id,
      categoryId: electronicsCategory.id
    },
    {
      name: 'Sony WH-1000XM5 Wireless Headphones',
      description: 'Industry-leading noise cancellation with exceptional sound quality. Comfortable design for all-day wear.',
      photoUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=2788&auto=format&fit=crop&ixlib=rb-4.0.3',
      minBidPrice: 29990.00,
      startTime: new Date(Date.now() - 172800000), // 2 days ago
      endTime: new Date(Date.now() + 16200000), // 4.5 hours from now
      sellerId: seller.id,
      categoryId: electronicsCategory.id
    },
    {
      name: 'Samsung 55" QLED 4K Smart TV',
      description: 'Stunning 4K resolution with Quantum Dot technology for vibrant colors. Smart features for streaming.',
      photoUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3',
      minBidPrice: 79990.00,
      startTime: new Date(Date.now() - 259200000), // 3 days ago
      endTime: new Date(Date.now() + 104400000), // 29 hours from now
      sellerId: seller.id,
      categoryId: electronicsCategory.id
    }
  ]

  // Sample upcoming auctions
  const upcomingAuctions = [
    {
      name: 'MacBook Pro M3 Pro (16-inch)',
      description: 'The most powerful MacBook Pro ever with the M3 Pro chip. Perfect for professionals.',
      photoUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3',
      minBidPrice: 249900.00,
      startTime: new Date(Date.now() + 172800000), // 2 days from now
      endTime: new Date(Date.now() + 604800000), // 7 days from now
      sellerId: seller.id,
      categoryId: electronicsCategory.id
    },
    {
      name: 'PlayStation 5 Pro Console',
      description: 'Next-generation gaming with stunning graphics and ultra-fast loading. Includes controller and cables.',
      photoUrl: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?q=80&w=2127&auto=format&fit=crop&ixlib=rb-4.0.3',
      minBidPrice: 54990.00,
      startTime: new Date(Date.now() + 432000000), // 5 days from now
      endTime: new Date(Date.now() + 864000000), // 10 days from now
      sellerId: seller.id,
      categoryId: electronicsCategory.id
    }
  ]

  // Sample closed auctions
  const closedAuctions = [
    {
      name: 'Bose QuietComfort Earbuds',
      description: 'Wireless noise cancelling earbuds with comfortable fit and amazing sound quality.',
      photoUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3',
      minBidPrice: 24900.00,
      startTime: new Date(Date.now() - 1209600000), // 14 days ago
      endTime: new Date(Date.now() - 604800000), // 7 days ago
      sellerId: seller.id,
      categoryId: electronicsCategory.id
    },
    {
      name: 'Kindle Paperwhite (11th Gen)',
      description: 'Waterproof e-reader with a 6.8" display and adjustable warm light. Perfect for reading anywhere.',
      photoUrl: 'https://images.pexels.com/photos/7290697/pexels-photo-7290697.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      minBidPrice: 14999.00,
      startTime: new Date(Date.now() - 1036800000), // 12 days ago
      endTime: new Date(Date.now() - 259200000), // 3 days ago
      sellerId: seller.id,
      categoryId: electronicsCategory.id
    }
  ]

  // Insert live auctions
  for (const auction of liveAuctions) {
    const product = await prisma.product.upsert({
      where: { 
        id: await getProductIdByName(auction.name) || 0
      },
      update: auction,
      create: auction
    })

    // Add some bids to the auction
    await prisma.bid.upsert({
      where: { 
        id: await getBidIdForProduct(product.id) || 0
      },
      update: {
        price: auction.minBidPrice * 0.7,
        bidderId: bidder.id,
        productId: product.id
      },
      create: {
        price: auction.minBidPrice * 0.7,
        bidderId: bidder.id,
        productId: product.id
      }
    })
  }

  // Insert upcoming auctions
  for (const auction of upcomingAuctions) {
    await prisma.product.upsert({
      where: { 
        id: await getProductIdByName(auction.name) || 0
      },
      update: auction,
      create: auction
    })
  }

  // Insert closed auctions
  for (const auction of closedAuctions) {
    const product = await prisma.product.upsert({
      where: { 
        id: await getProductIdByName(auction.name) || 0
      },
      update: auction,
      create: auction
    })

    // Add winning bid to closed auction
    await prisma.bid.upsert({
      where: { 
        id: await getBidIdForProduct(product.id) || 0
      },
      update: {
        price: auction.minBidPrice * 0.35,
        bidderId: bidder.id,
        productId: product.id
      },
      create: {
        price: auction.minBidPrice * 0.35,
        bidderId: bidder.id,
        productId: product.id
      }
    })
  }

  console.log('✅ Seed complete.')
}

// Helper function to get product ID by name
async function getProductIdByName(name) {
  const product = await prisma.product.findFirst({
    where: { name }
  })
  return product?.id
}

// Helper function to get bid ID for product
async function getBidIdForProduct(productId) {
  const bid = await prisma.bid.findFirst({
    where: { productId }
  })
  return bid?.id
}

// Add this function at the end of the file, before any module.exports
async function addNewProduct() {
  console.log('Adding new test product with next year end time...');
  
  // Get the current date
  const now = new Date();
  
  // Create end date for next year
  const nextYear = new Date();
  nextYear.setFullYear(now.getFullYear() + 1);
  
  try {
    // First, check if we have at least one seller user
    const seller = await prisma.user.findFirst({
      where: { role: 'SELLER' }
    });
    
    if (!seller) {
      console.log('No seller found. Create a seller first.');
      return;
    }
    
    // Check if we have at least one category
    const category = await prisma.category.findFirst();
    
    if (!category) {
      console.log('No category found. Create a category first.');
      return;
    }
    
    // Create a new product with next year end time
    const product = await prisma.product.create({
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
    });
    
    console.log('Added new product:', product);
  } catch (error) {
    console.error('Error adding product:', error);
  }
}

// If this script is run directly (not imported as a module)
if (require.main === module) {
  // Call the function to add a new product
  addNewProduct()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
