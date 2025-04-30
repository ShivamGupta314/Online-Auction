import { prisma } from '../prismaClient.js'

export const uploadProduct = async (req, res) => {
  const { name, description, photoUrl, minBidPrice, startTime, endTime, categoryId } = req.body
  const sellerId = req.user.id

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        photoUrl,
        minBidPrice: parseFloat(minBidPrice),
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        categoryId: parseInt(categoryId),
        sellerId,
      },
    })
    res.status(201).json(product)
  } catch (err) {
    console.error(err)
    res.status(400).json({ error: 'Failed to upload product' })
  }
}

export const getMyProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: req.user.id },
      include: { bids: true, category: true },
    })
    res.json(products)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
}
