import { prisma } from '../prismaClient.js'
import { isAuctionActive } from '../utils/auctionUtils.js'
import { isAuctionExpired } from '../utils/auctionUtils.js'



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
  const userId = req.user.id
  const { productId, price } = req.body

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: true, bids: true },
  })

  if (!product) return res.status(404).json({ error: 'Product not found' })

  if (!isAuctionActive(product)) {
    return res.status(400).json({ error: 'Auction is not active' })
  }


  if (product.sellerId === userId) {
    return res.status(403).json({ error: 'You cannot bid on your own product' })
  }

  const highestBid = await prisma.bid.findFirst({
    where: { productId },
    orderBy: { price: 'desc' },
  })

  const minAllowedBid = highestBid ? highestBid.price + 1 : product.minBidPrice
  if (price < minAllowedBid) {
    return res.status(400).json({ error: `Bid must be at least ${minAllowedBid}` })
  }

  const bid = await prisma.bid.create({
    data: {
      price,
      productId,
      bidderId: userId,
    },
  })

  res.status(201).json(bid)
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



export const getMyBids = async (req, res) => {
  const userId = req.user.id

  try {
    // 1. Get user’s bids
    const userBids = await prisma.bid.findMany({
      where: { bidderId: userId },
      include: {
        product: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!userBids.length) return res.json([])

    // 2. Product IDs
    const productIds = [...new Set(userBids.map(b => b.productId))]

    // 3. Get highest bids per product
    const highestBids = await prisma.bid.findMany({
      where: { productId: { in: productIds } },
      orderBy: [
        { price: 'desc' },
        { createdAt: 'asc' }
      ],
      distinct: ['productId']
    })

    const highestBidMap = new Map()
    for (const bid of highestBids) {
      highestBidMap.set(bid.productId, bid.id)
    }

    // 4. Map + enrich each bid
    const enriched = userBids.map(bid => ({
      ...bid,
      isWinning: highestBidMap.get(bid.productId) === bid.id,
      isExpired: isAuctionExpired(bid.product.endTime)
    }))

    res.json(enriched)
  } catch (err) {
    console.error('[GET] /api/bids/mine', err)
    res.status(500).json({ message: 'Failed to fetch your bids' })
  }
}
