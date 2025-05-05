import { prisma } from '../prismaClient.js'

// Get system-wide statistics for admin dashboard
export const getAdminDashboard = async (req, res) => {
  try {
    // Get counts of various entities
    const userCount = await prisma.user.count()
    const productCount = await prisma.product.count()
    const bidCount = await prisma.bid.count()
    const categoryCount = await prisma.category.count()

    // Get user counts by role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { id: true }
    })

    // Get products with bids vs without bids
    const productsWithBids = await prisma.product.count({
      where: {
        bids: {
          some: {}
        }
      }
    })

    // Get recent products (last 7 days)
    const recentProducts = await prisma.product.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Get recent bids (last 7 days)
    const recentBids = await prisma.bid.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    })

    // Calculate average bids per product
    const avgBidsPerProduct = bidCount / productCount || 0

    // Get top categories by product count
    const topCategories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        products: { _count: 'desc' }
      },
      take: 5
    })

    res.json({
      counts: {
        users: userCount,
        products: productCount,
        bids: bidCount,
        categories: categoryCount
      },
      usersByRole: usersByRole.reduce((acc, curr) => {
        acc[curr.role] = curr._count.id
        return acc
      }, {}),
      products: {
        withBids: productsWithBids,
        withoutBids: productCount - productsWithBids,
        recentlyAdded: recentProducts
      },
      bids: {
        recentBids,
        avgPerProduct: parseFloat(avgBidsPerProduct.toFixed(2))
      },
      topCategories: topCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        productCount: cat._count.products
      }))
    })
  } catch (err) {
    console.error('[GET] /api/admin/dashboard', err)
    res.status(500).json({ error: 'Failed to load admin dashboard' })
  }
}

// Get all users with their role for admin management
export const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        _count: {
          select: {
            products: true,
            bids: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    })

    res.json(users.map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      productCount: user._count.products,
      bidCount: user._count.bids
    })))
  } catch (err) {
    console.error('[GET] /api/admin/users', err)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
}

// Update user role (ADMIN only)
export const updateUserRole = async (req, res) => {
  const userId = parseInt(req.params.id)
  const { role } = req.body

  if (!['ADMIN', 'SELLER', 'BIDDER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        role: true
      }
    })

    res.json(updated)
  } catch (err) {
    console.error('[PUT] /api/admin/users/:id/role', err)
    res.status(500).json({ error: 'Failed to update user role' })
  }
}

// Get problematic products (with 0 bids and past end date)
export const getProblematicProducts = async (req, res) => {
  try {
    const now = new Date()
    
    const problematicProducts = await prisma.product.findMany({
      where: {
        endTime: { lt: now },
        bids: { none: {} }
      },
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      },
      orderBy: {
        endTime: 'desc'
      }
    })

    res.json(problematicProducts)
  } catch (err) {
    console.error('[GET] /api/admin/products/problematic', err)
    res.status(500).json({ error: 'Failed to fetch problematic products' })
  }
} 