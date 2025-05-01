import { prisma } from '../prismaClient.js'

export const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany()
    res.json(categories)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch categories' })
  }
}
