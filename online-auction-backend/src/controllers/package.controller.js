import { prisma } from '../prismaClient.js'

export const getAllPackages = async (req, res) => {
  try {
    const packages = await prisma.package.findMany()
    res.json(packages)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch packages' })
  }
}
