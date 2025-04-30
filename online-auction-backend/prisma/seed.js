import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.category.createMany({
    data: [
      { name: 'Electronics' },
      { name: 'Books' },
      { name: 'Furniture' },
      { name: 'Vehicles' }
    ],
    skipDuplicates: true
  })

  await prisma.package.createMany({
    data: [
      { name: 'Basic', price: 10 },
      { name: 'Pro', price: 30 },
      { name: 'Unlimited', price: 50 }
    ],
    skipDuplicates: true
  })

  console.log('✅ Seed complete')
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
