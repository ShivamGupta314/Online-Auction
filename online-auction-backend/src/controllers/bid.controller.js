import { prisma } from '../prismaClient.js'


export const getBidsForProduct = async (req, res) => {
    const productId = parseInt(req.params.id)
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
  
    const validSortFields = ['price', 'createdAt']
    const sortBy = validSortFields.includes(req.query.sortBy) ? req.query.sortBy : 'price'
    const order = req.query.order === 'asc' ? 'asc' : 'desc'
  
    try {
      const total = await prisma.bid.count({ where: { productId } })
  
      const bids = await prisma.bid.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { [sortBy]: order },
        include: {
          bidder: {
            select: { id: true, username: true, email: true }
          }
        }
      })
  
      res.json({
        bids,
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
        sortBy,
        order
      })
    } catch (err) {
      console.error('[GET] /api/bids/product/:id', err)
      res.status(500).json({ message: 'Failed to fetch bids' })
    }
  }
  
  

export const placeBid = async (req, res) => {
  const { productId, price } = req.body
  const bidderId = req.user.id

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { bids: true }
    })

    if (!product) return res.status(404).json({ message: 'Product not found' })

    const now = new Date()
    if (now < product.startTime || now > product.endTime) {
      return res.status(400).json({ message: 'Bidding not active for this product' })
    }

    const highestBid = await prisma.bid.findFirst({
      where: { productId },
      orderBy: { price: 'desc' }
    })

    const minPrice = highestBid ? highestBid.price : product.minBidPrice
    if (price <= minPrice) {
      return res.status(400).json({ message: `Bid must be greater than ${minPrice}` })
    }

    const bid = await prisma.bid.create({
      data: {
        productId,
        price,
        bidderId
      }
    })

    res.status(201).json(bid)
  } catch (err) {
    console.error('[POST] /api/bids', err)
    res.status(500).json({ message: 'Failed to place bid' })
  }
}

export const getHighestBid = async (req, res) => {
    const productId = parseInt(req.params.id)
  
    try {
      const highestBid = await prisma.bid.findFirst({
        where: { productId },
        orderBy: { price: 'desc' },
        include: {
          bidder: {
            select: { id: true, username: true, email: true }
          }
        }
      })
  
      if (!highestBid) {
        return res.status(404).json({ message: 'No bids found for this product' })
      }
  
      res.json(highestBid)
    } catch (err) {
      console.error('[GET] /api/products/:id/highest-bid', err)
      res.status(500).json({ message: 'Failed to fetch highest bid' })
    }
  }
  
  export const getBidSummary = async (req, res) => {
    const productId = parseInt(req.params.id)
    const sellerId = req.user.id
  
    try {
      // Ensure seller owns this product
      const product = await prisma.product.findUnique({
        where: { id: productId }
      })
  
      if (!product) return res.status(404).json({ message: 'Product not found' })
      if (product.sellerId !== sellerId)
        return res.status(403).json({ message: 'Forbidden: Not your product' })
  
      const bids = await prisma.bid.findMany({
        where: { productId },
        include: {
          bidder: { select: { username: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
  
      if (!bids.length) {
        return res.json({
          highestBid: 0,
          totalBids: 0,
          averageBid: 0,
          latestBidder: null
        })
      }
  
      const prices = bids.map(b => b.price)
      const highestBid = Math.max(...prices)
      const totalBids = bids.length
      const averageBid = parseFloat((prices.reduce((a, b) => a + b, 0) / totalBids).toFixed(2))
      const latestBidder = bids[0].bidder.username
  
      res.json({ highestBid, totalBids, averageBid, latestBidder })
    } catch (err) {
      console.error('[GET] /api/bids/product/:id/summary', err)
      res.status(500).json({ message: 'Failed to fetch bid summary' })
    }
  }
  export const getPublicBidHighlight = async (req, res) => {
    const productId = parseInt(req.params.id)
  
    try {
      const bids = await prisma.bid.findMany({
        where: { productId },
        include: {
          bidder: { select: { username: true } }
        },
        orderBy: { createdAt: 'desc' }
      })
  
      if (!bids.length) {
        return res.json({
          highestBid: 0,
          latestBidder: null
        })
      }
  
      const highestBid = Math.max(...bids.map(b => b.price))
      const latestBidder = bids[0].bidder.username
  
      res.json({ highestBid, latestBidder })
    } catch (err) {
      console.error('[GET] /api/products/:id/highlight-bid', err)
      res.status(500).json({ message: 'Failed to fetch public bid highlight' })
    }
  }
  