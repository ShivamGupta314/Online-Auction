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

  // ✅ Insert categories
  await prisma.category.createMany({
    data: [
      { name: 'Electronics' },
      { name: 'Fashion' },
      { name: 'Books' },
      { name: 'Vehicles' }
    ]
  })

  // ✅ Insert packages
  await prisma.package.createMany({
    data: [
      { name: 'Gold', price: 49.99 },
      { name: 'Platinum', price: 99.99 }
    ]
  })

  console.log('✅ Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
