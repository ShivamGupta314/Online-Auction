// Already shared, but repeating for clarity
import { prisma } from '../../src/prismaClient.js'

export const cleanTestDb = async () => {
    console.log('🧹 Cleaning up test database...')
    
    try {
      // First attempt: Clean deletion respecting constraints
      await prisma.$transaction([
        prisma.bid.deleteMany(),
        prisma.product.deleteMany(),
        prisma.userPackage.deleteMany(),
        prisma.package.deleteMany(),
        prisma.user.deleteMany(),
        prisma.category.deleteMany()
      ]);
    } catch (error) {
      // If that fails, try more forceful cleanup with individual deletes
      console.log('Standard cleanup failed, trying alternative method...');
      
      try {
        // Delete bids first
        await prisma.bid.deleteMany();
        
        // Delete products 
        await prisma.product.deleteMany();
        
        // Delete user packages
        await prisma.userPackage.deleteMany();
        
        // Delete packages
        await prisma.package.deleteMany();
        
        // Delete users
        await prisma.user.deleteMany();
        
        // Delete categories last
        await prisma.category.deleteMany();
      } catch (innerError) {
        console.error('Failed to clean database:', innerError);
        // Don't throw, so tests can still run even if cleanup fails
      }
    }
  }
  