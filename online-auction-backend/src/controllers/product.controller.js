import { prisma } from '../prismaClient.js'

// Upload a product (SELLER only)
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
        sellerId
      }
    })

    res.status(201).json(product)
  } catch (err) {
    console.error('[POST] /api/products', err)
    res.status(400).json({ error: 'Failed to upload product' })
  }
}

// Get all products uploaded by the logged-in SELLER
export const getMyProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { sellerId: req.user.id },
      include: { bids: true, category: true }
    })

    res.json(products)
  } catch (err) {
    console.error('[GET] /api/products/mine', err)
    res.status(500).json({ error: 'Failed to fetch your products' })
  }
}

// Public: Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        },
        bids: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    res.json(products)
  } catch (err) {
    console.error('[GET] /api/products', err)
    res.status(500).json({ error: 'Failed to fetch products' })
  }
}

export const getProductDetailWithBids = async (req, res) => {
  const productId = parseInt(req.params.id)

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        seller: { select: { username: true } }
      }
    })

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const bids = await prisma.bid.findMany({
      where: { productId },
      include: {
        bidder: { select: { username: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const totalSeconds = Math.floor(timeLeft / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const timeLeftFormatted = `${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`



    const highestBid = bids.length ? Math.max(...bids.map(b => b.price)) : 0
    const latestBidder = bids.length ? bids[0].bidder.username : null

    res.json({
      product,
      highestBid,
      latestBidder,
      isExpired,
      timeLeft,
      timeLeftFormatted
    })
    
  } catch (err) {
    console.error('[GET] /api/products/:id/detail', err)
    res.status(500).json({ message: 'Failed to fetch product detail' })
  }
}
