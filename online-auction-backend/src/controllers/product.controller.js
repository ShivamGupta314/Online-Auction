import { prisma } from '../prismaClient.js'
import { getAuctionStatus } from '../utils/auctionUtils.js'
import { Parser } from 'json2csv'
import ExcelJS from 'exceljs'

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

// Public: Get all products with filters + auction status
export const getAllProducts = async (req, res) => {
  try {
    const { search, category, min, max, status } = req.query

    const filters = {}

    if (search) {
      filters.name = { contains: search, mode: 'insensitive' }
    }

    if (category) {
      filters.categoryId = parseInt(category)
    }

    if (min || max) {
      filters.minBidPrice = {}
      if (min) filters.minBidPrice.gte = parseFloat(min)
      if (max) filters.minBidPrice.lte = parseFloat(max)
    }

    // Handle status filter
    const now = new Date()
    if (status === 'active') {
      // Active auctions: started but not ended
      filters.startTime = { lte: now }
      filters.endTime = { gt: now }
    } else if (status === 'upcoming') {
      // Upcoming auctions: not started yet
      filters.startTime = { gt: now }
    } else if (status === 'ended') {
      // Ended auctions: end time in the past
      filters.endTime = { lt: now }
    }

    const products = await prisma.product.findMany({
      where: filters,
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
        bids: {
          include: {
            bidder: {
              select: {
                username: true
              }
            }
          },
          orderBy: {
            price: 'desc'
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const enriched = products.map(product => {
      const { isExpired, timeLeft, timeLeftFormatted } = getAuctionStatus(product)
      const highestBid = product.bids.length ? Math.max(...product.bids.map(b => b.price)) : null

      return {
        ...product,
        highestBid,
        isExpired,
        timeLeft,
        timeLeftFormatted
      }
    })

    res.json(enriched)
  } catch (err) {
    console.error('[GET] /api/products (filtered)', err)
    res.status(500).json({ error: 'Failed to fetch filtered products' })
  }
}

// Public: Get single product details with bids and auction status
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

    const highestBid = bids.length ? Math.max(...bids.map(b => b.price)) : null
    const latestBidder = bids.length ? bids[0].bidder.username : null

    const { isExpired, timeLeft, timeLeftFormatted } = getAuctionStatus(product)

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

// Seller dashboard with summary + sorting
export const getSellerDashboard = async (req, res) => {
  const sellerId = req.user.id
  const { sort = 'createdAt', order = 'desc' } = req.query

  try {
    const products = await prisma.product.findMany({
      where: { sellerId },
      include: {
        bids: true,
        category: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    let totalBids = 0
    let totalWithBids = 0
    let totalExpired = 0
    let totalActive = 0

    const enriched = products.map(product => {
      const numBids = product.bids.length
      totalBids += numBids
      if (numBids > 0) totalWithBids++

      const { isExpired, timeLeft, timeLeftFormatted } = getAuctionStatus(product)
      isExpired ? totalExpired++ : totalActive++

      const highestBid = numBids
        ? Math.max(...product.bids.map(b => b.price))
        : null

      const averageBid = numBids
        ? (
            product.bids.reduce((sum, b) => sum + b.price, 0) / numBids
          ).toFixed(2)
        : null

      return {
        id: product.id,
        name: product.name,
        category: product.category.name,
        minBidPrice: product.minBidPrice,
        totalBids: numBids,
        highestBid,
        averageBid: averageBid ? Number(averageBid) : null,
        hasBids: numBids > 0,
        isExpired,
        timeLeft,
        timeLeftFormatted,
        startTime: product.startTime,
        endTime: product.endTime
      }
    })

    const sortedProducts = enriched.sort((a, b) => {
      const valA = a[sort]
      const valB = b[sort]

      if (valA === undefined || valB === undefined) return 0

      return order === 'desc'
        ? valB - valA
        : valA - valB
    })

    res.json({
      summary: {
        totalProducts: products.length,
        totalBids,
        totalWithBids,
        totalExpired,
        totalActive
      },
      products: sortedProducts
    })
  } catch (err) {
    console.error('[GET] /api/seller/summary', err)
    res.status(500).json({ error: 'Failed to load seller dashboard' })
  }
}

// Excel Export for Seller Dashboard
export const exportSellerDashboardExcel = async (req, res) => {
  const sellerId = req.user.id

  try {
    const products = await prisma.product.findMany({
      where: { sellerId },
      include: { bids: true, category: true },
      orderBy: { createdAt: 'desc' }
    })

    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Seller Dashboard')

    // 🏷️ Title row
    sheet.mergeCells('A1', 'J1')
    sheet.getCell('A1').value = 'Seller Product Performance Report'
    sheet.getCell('A1').font = { size: 16, bold: true }
    sheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' }
    sheet.addRow([]) // spacer

    // 📊 Header row
    sheet.columns = [
      { key: 'name', width: 25 },
      { key: 'category', width: 20 },
      { key: 'minBidPrice', width: 15 },
      { key: 'totalBids', width: 12 },
      { key: 'highestBid', width: 15 },
      { key: 'averageBid', width: 15 },
      { key: 'hasBids', width: 10 },
      { key: 'isExpired', width: 12 },
      { key: 'startTime', width: 25 },
      { key: 'endTime', width: 25 }
    ]

    // Add Header row data
    sheet.addRow({
      name: 'Name',
      category: 'Category',
      minBidPrice: 'Min Bid Price',
      totalBids: 'Total Bids',
      highestBid: 'Highest Bid',
      averageBid: 'Average Bid',
      hasBids: 'Has Bids',
      isExpired: 'Is Expired',
      startTime: 'Start Time',
      endTime: 'End Time'
    }).font = { bold: true }

    // ✏️ Accumulators
    let totalBidCount = 0
    let allBidPrices = []
    let allHighestBids = []
    let totalExpired = 0
    let totalActive = 0

    // Add product rows to the sheet
    for (const product of products) {
      const bids = product.bids
      const numBids = bids.length
      const highestBid = numBids ? Math.max(...bids.map(b => b.price)) : null
      const averageBid = numBids
        ? (bids.reduce((sum, b) => sum + b.price, 0) / numBids).toFixed(2)
        : null
      const { isExpired } = getAuctionStatus(product)

      sheet.addRow({
        name: product.name,
        category: product.category.name,
        minBidPrice: product.minBidPrice,
        totalBids: numBids,
        highestBid,
        averageBid: averageBid ? Number(averageBid) : null,
        hasBids: numBids > 0,
        isExpired,
        startTime: product.startTime,
        endTime: product.endTime
      })

      totalBidCount += numBids
      if (highestBid !== null) allHighestBids.push(highestBid)
      allBidPrices.push(...bids.map(b => b.price))

      isExpired ? totalExpired++ : totalActive++
    }

    // ⬜ Spacer
    sheet.addRow([])

    // 📦 Totals row
    const totalsRow = sheet.addRow({
      name: 'TOTALS:',
      totalBids: totalBidCount,
      highestBid: allHighestBids.length ? Math.max(...allHighestBids) : null,
      averageBid: allBidPrices.length
        ? Number((allBidPrices.reduce((sum, b) => sum + b, 0) / allBidPrices.length).toFixed(2))
        : null
    })

    totalsRow.font = { bold: true }

    // 📦 Expired/Active row
    const statusRow = sheet.addRow({
      name: `Active: ${totalActive}, Expired: ${totalExpired}`
    })
    statusRow.font = { italic: true }

    // 🎯 Auto filter + styling
    sheet.autoFilter = {
      from: 'A3',
      to: 'J3'
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', 'attachment; filename="seller_dashboard.xlsx"')

    await workbook.xlsx.write(res)
    res.end()
  } catch (err) {
    console.error('[GET] /api/seller/summary/excel', err)
    res.status(500).json({ error: 'Failed to export Excel file' })
  }
}

// CSV Export for Seller Dashboard
export const exportSellerDashboardCSV = async (req, res) => {
  const sellerId = req.user.id

  try {
    const products = await prisma.product.findMany({
      where: { sellerId },
      include: { bids: true, category: true },
      orderBy: { createdAt: 'desc' }
    })

    const enriched = products.map(product => {
      const numBids = product.bids.length
      const highestBid = numBids ? Math.max(...product.bids.map(b => b.price)) : null
      const averageBid = numBids
        ? (product.bids.reduce((sum, b) => sum + b.price, 0) / numBids).toFixed(2)
        : null
      const { isExpired } = getAuctionStatus(product)

      return {
        name: product.name,
        category: product.category.name,
        minBidPrice: product.minBidPrice,
        totalBids: numBids,
        highestBid,
        averageBid: averageBid ? Number(averageBid) : null,
        hasBids: numBids > 0,
        isExpired,
        startTime: product.startTime,
        endTime: product.endTime
      }
    })

    const parser = new Parser()
    const csv = parser.parse(enriched)

    res.header('Content-Type', 'text/csv')
    res.attachment('seller_dashboard.csv')
    res.send(csv)
  } catch (err) {
    console.error('[GET] /api/seller/summary/csv', err)
    res.status(500).json({ error: 'Failed to export dashboard CSV' })
  }
}

// At the bottom of product.controller.js

export const updateProduct = async (req, res) => {
  const productId = parseInt(req.params.id)
  const sellerId = req.user.id

  try {
    const existing = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!existing) {
      return res.status(404).json({ error: 'Product not found' })
    }

    if (existing.sellerId !== sellerId) {
      return res.status(403).json({ error: 'You cannot edit this product' })
    }

    const updated = await prisma.product.update({
      where: { id: productId },
      data: req.body
    })

    res.json(updated)
  } catch (err) {
    console.error('[PUT] /api/products/:id', err)
    res.status(500).json({ error: 'Failed to update product' })
  }
}

export const deleteProduct = async (req, res) => {
  const productId = parseInt(req.params.id);
  const sellerId = req.user.id;

  try {
    // Check if product exists and belongs to this seller
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { bids: true }
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.sellerId !== sellerId) {
      return res.status(403).json({ error: 'You cannot delete this product' });
    }

    // Check if product has bids
    if (product.bids.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete product with existing bids. Contact an administrator for assistance.'
      });
    }

    // Delete the product
    await prisma.product.delete({
      where: { id: productId }
    });

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error('[DELETE] /api/products/:id', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
}

/**
 * Get product statistics for the landing page
 */
export const getProductStatistics = async (req, res) => {
  try {
    // Get total number of users (customers)
    const totalCustomers = await prisma.user.count({
      where: {
        role: 'BIDDER'
      }
    })

    // Get completed auctions
    const completedAuctions = await prisma.product.findMany({
      where: {
        endTime: {
          lt: new Date()
        },
        bids: {
          some: {}
        }
      },
      include: {
        bids: {
          orderBy: {
            price: 'desc'
          },
          take: 1
        }
      }
    })

    // Calculate average discount and total savings
    let totalSavings = 0
    let totalDiscountPercentage = 0

    completedAuctions.forEach(auction => {
      if (auction.bids.length > 0) {
        const finalPrice = auction.bids[0].price
        const mrp = auction.minBidPrice
        const savings = mrp - finalPrice
        const discountPercentage = (savings / mrp) * 100

        totalSavings += savings
        totalDiscountPercentage += discountPercentage
      }
    })

    const averageDiscount = completedAuctions.length > 0
      ? Math.round(totalDiscountPercentage / completedAuctions.length)
      : 85 // Default if no completed auctions

    res.json({
      averageDiscount,
      totalCustomers: totalCustomers || 10000, // Default if no customers
      totalSavings: Math.round(totalSavings) || 50000000 // Default if no savings
    })
  } catch (error) {
    console.error('Error fetching product statistics:', error)
    res.status(500).json({ error: 'Failed to fetch product statistics' })
  }
}

export default {
  uploadProduct,
  getMyProducts,
  getAllProducts,
  getProductDetailWithBids,
  updateProduct,
  deleteProduct,
  getProductStatistics
}
