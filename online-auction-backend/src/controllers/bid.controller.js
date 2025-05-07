import { prisma } from '../prismaClient.js'
import { isAuctionActive, isAuctionExpired } from '../utils/auctionUtils.js'
import notificationService from '../services/notification.service.js'
import socketService from '../utils/socketService.js'



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

  try {
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
      include: {
        bidder: true
      }
    })

    const minAllowedBid = highestBid ? highestBid.price + 1 : product.minBidPrice
    if (price < minAllowedBid) {
      return res.status(400).json({ error: `Bid must be at least ${minAllowedBid}` })
    }

    // Get bidder information for real-time updates
    const bidder = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true }
    })

    const bid = await prisma.bid.create({
      data: {
        price,
        productId,
        bidderId: userId,
      },
    })

    // Add bidder username to bid object for WebSocket events
    const bidWithUsername = {
      ...bid,
      bidderUsername: bidder.username
    }

    // Emit real-time bid event via WebSocket
    socketService.emitNewBid(productId, bidWithUsername, product)
    
    // If this is a winning bid (auction ending soon), send real-time notification
    const timeRemaining = new Date(product.endTime) - new Date()
    if (timeRemaining <= 60000) { // Last minute
      socketService.sendUserNotification(
        userId,
        'BID_WINNING',
        { 
          message: `Your bid on ${product.name} is currently winning! Auction ends soon.`,
          productId
        }
      )
    }

    // Notify seller of new bid
    notificationService.notifySellerOfNewBid(bid)
      .catch(err => console.error('Failed to notify seller of new bid:', err))
    
    // Send real-time notification to seller
    socketService.sendUserNotification(
      product.sellerId,
      'NEW_BID',
      {
        message: `New bid: ${bidder.username} placed a bid of $${price} on ${product.name}`,
        productId,
        bid: {
          price,
          bidderUsername: bidder.username
        }
      }
    )

    // Notify previous highest bidder if they've been outbid
    if (highestBid && highestBid.bidderId !== userId) {
      notificationService.notifyPreviousBidderOfOutbid(bid, highestBid.bidderId)
        .catch(err => console.error('Failed to notify previous bidder:', err))
      
      // Send real-time notification to outbid user
      socketService.sendUserNotification(
        highestBid.bidderId,
        'OUTBID',
        {
          message: `You've been outbid on ${product.name}. Current price: $${price}`,
          productId,
          currentPrice: price
        }
      )
    }

    res.status(201).json(bid)
  } catch (err) {
    console.error('[POST] /api/bids', err)
    res.status(500).json({ error: 'Failed to place bid' })
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



export const getMyBids = async (req, res) => {
  const userId = req.user.id

  try {
    // 1. Get user's bids
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
