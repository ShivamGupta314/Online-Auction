import { prisma } from '../prismaClient.js'

export const assignPackage = async (req, res) => {
    const userId = parseInt(req.params.id, 10)
    const { packageId } = req.body
  
    console.log('[assignPackage] userId:', userId, 'packageId:', packageId)
  
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' })
    }
  
    try {
        const user = await prisma.user.findUnique({ where: { id: userId } })
        console.log('👤 user:', user)
        
        const pkg = await prisma.package.findUnique({ where: { id: packageId } })
        console.log('📦 package:', pkg)
        
        if (!user || !pkg) {
          if (!user) console.warn('❌ User not found')
          if (!pkg) console.warn('❌ Package not found')
          return res.status(404).json({ message: 'User or Package not found' })
        }
        
  
      const result = await prisma.userPackage.create({
        data: { userId, packageId },
      })
  
      res.status(201).json(result)
    } catch (error) {
      console.error('[POST] /api/users/:id/packages', error)
      res.status(500).json({ error: 'Internal server error' })
    }
  }
  
export const getCurrentUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        packages: {
          include: {
            package: true,
          },
        },
      },
    })

    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json(user)
  } catch (err) {
    console.error('[GET] /api/auth/me', err)
    res.status(500).json({ error: 'Internal server error' })
  }
}
export const getUserPackages = async (req, res) => {
  const userId = parseInt(req.params.id)

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' })
  }

  try {
    const userWithPackages = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        packages: {
          include: {
            package: true,
          },
        },
      },
    })

    if (!userWithPackages) {
      return res.status(404).json({ message: 'User not found' })
    }

    const result = userWithPackages.packages.map((up) => up.package)

    res.json(result)
  } catch (error) {
    console.error('[GET] /api/users/:id/packages', error)
    res.status(500).json({ error: 'Internal server error' })
  }
}

export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get active auctions count (total live auctions)
    const activeAuctionsCount = await prisma.product.count({
      where: {
        endTime: { gt: new Date() },
        startTime: { lt: new Date() }
      }
    });

    // Get user's active bids
    const userActiveBids = await prisma.bid.count({
      where: {
        bidderId: userId,
        product: {
          endTime: { gt: new Date() }
        }
      }
    });

    // Get user's won auctions
    // Since isWinningBid doesn't exist, we'll count auctions where user has the highest bid
    const endedAuctions = await prisma.product.findMany({
      where: {
        endTime: { lt: new Date() }
      },
      include: {
        bids: {
          orderBy: {
            price: 'desc'
          },
          take: 1,
          where: {
            bidderId: userId
          }
        }
      }
    });
    
    // Count auctions where user has the highest bid
    const userWonAuctions = endedAuctions.filter(auction => 
      auction.bids.length > 0
    ).length;

    // Calculate total spent on won auctions
    const totalSpent = endedAuctions.reduce((sum, auction) => {
      if (auction.bids && auction.bids.length > 0) {
        return sum + auction.bids[0].price;
      }
      return sum;
    }, 0);

    // Mock change data (in a real app, this would compare with previous period)
    const stats = {
      activeAuctions: activeAuctionsCount,
      activeBids: userActiveBids,
      wonAuctions: userWonAuctions,
      totalSpent: totalSpent,
      change: {
        activeAuctions: '+12%',
        activeBids: '+3%',
        wonAuctions: '+1%',
        totalSpent: '+5%'
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('[GET] /api/users/stats', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's watchlist items
    const watchlistItems = await prisma.watchlist.findMany({
      where: {
        userId: userId
      },
      include: {
        product: {
          include: {
            category: true,
            bids: {
              orderBy: {
                price: 'desc'
              },
              take: 1
            }
          }
        }
      }
    });

    // Format the response
    const formattedWatchlist = watchlistItems.map(item => {
      const product = item.product;
      const highestBid = product.bids.length > 0 ? product.bids[0].price : product.minBidPrice;
      
      // Calculate time left
      const now = new Date();
      const endTime = new Date(product.endTime);
      const timeLeftMs = Math.max(0, endTime - now);
      
      // Format time left
      let timeLeft = '';
      if (timeLeftMs <= 0) {
        timeLeft = 'Ended';
      } else {
        const days = Math.floor(timeLeftMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeftMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        timeLeft = days > 0 ? `${days}d ${hours}h` : `${hours}h ${Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60))}m`;
      }

      return {
        id: product.id,
        title: product.name,
        currentBid: highestBid,
        timeLeft: timeLeft,
        endTime: product.endTime,
        image: product.photoUrl
      };
    });

    res.json(formattedWatchlist);
  } catch (error) {
    console.error('[GET] /api/users/watchlist', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { auctionId } = req.body;

    // Check if already in watchlist
    const existingItem = await prisma.watchlist.findFirst({
      where: {
        userId: userId,
        productId: auctionId
      }
    });

    if (existingItem) {
      return res.status(400).json({ message: 'Item already in watchlist' });
    }

    // Add to watchlist
    const watchlistItem = await prisma.watchlist.create({
      data: {
        userId: userId,
        productId: auctionId
      }
    });

    res.status(201).json({ success: true, watchlistItem });
  } catch (error) {
    console.error('[POST] /api/users/watchlist', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const auctionId = req.params.auctionId;

    // Find and delete the watchlist item
    await prisma.watchlist.deleteMany({
      where: {
        userId: userId,
        productId: auctionId
      }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('[DELETE] /api/users/watchlist/:auctionId', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserWonAuctions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all ended auctions
    const endedAuctions = await prisma.product.findMany({
      where: {
        endTime: { lt: new Date() }
      },
      include: {
        category: true,
        bids: {
          orderBy: {
            price: 'desc'
          },
          take: 1
        }
      }
    });

    // Filter for auctions where user has the highest bid
    const wonAuctions = endedAuctions.filter(auction => 
      auction.bids.length > 0 && 
      auction.bids[0].bidderId === userId
    );

    // Format the response
    const formattedWonAuctions = wonAuctions.map(auction => ({
      id: auction.id,
      name: auction.name,
      description: auction.description,
      photoUrl: auction.photoUrl,
      minBidPrice: auction.minBidPrice,
      winningBid: auction.bids.length > 0 ? auction.bids[0].price : null,
      endTime: auction.endTime,
      category: auction.category ? auction.category.name : null
    }));

    res.json(formattedWonAuctions);
  } catch (error) {
    console.error('[GET] /api/users/won-auctions', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's bids
    const userBids = await prisma.bid.findMany({
      where: {
        bidderId: userId
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      include: {
        product: true
      }
    });

    // Check for outbids (bids on products user has bid on, but by other users)
    const outbidEvents = await prisma.bid.findMany({
      where: {
        product: {
          bids: {
            some: {
              bidderId: userId
            }
          }
        },
        bidderId: {
          not: userId
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5,
      include: {
        product: true
      }
    });

    // Get products that ended where user has highest bid
    const endedProducts = await prisma.product.findMany({
      where: {
        endTime: { lt: new Date() },
        bids: {
          some: {
            bidderId: userId
          }
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
    });

    // Filter for winning bids (highest bid on ended products)
    const winningBids = endedProducts
      .filter(product => 
        product.bids.length > 0 && 
        product.bids[0].bidderId === userId
      )
      .map(product => product.bids[0]);

    // Combine and format the activity
    let combinedActivity = [
      ...userBids.map(bid => ({
        id: bid.id,
        action: 'placed a bid',
        item: bid.product.name,
        time: formatTimeAgo(bid.createdAt),
        amount: `₹${bid.price.toLocaleString('en-IN')}`,
        auctionId: bid.productId
      })),
      ...outbidEvents.map(bid => ({
        id: `outbid-${bid.id}`,
        action: 'outbid by another user',
        item: bid.product.name,
        time: formatTimeAgo(bid.createdAt),
        amount: `₹${bid.price.toLocaleString('en-IN')}`,
        auctionId: bid.productId
      })),
      ...(winningBids || []).map(bid => ({
        id: `won-${bid.id}`,
        action: 'won auction',
        item: 'Auction item', // We don't have product name here
        time: formatTimeAgo(bid.createdAt),
        amount: `₹${bid.price.toLocaleString('en-IN')}`,
        auctionId: bid.productId
      }))
    ];

    // Sort by time (most recent first)
    combinedActivity.sort((a, b) => {
      const timeA = parseTimeAgo(a.time);
      const timeB = parseTimeAgo(b.time);
      return timeA - timeB;
    });

    // Take the 10 most recent activities
    combinedActivity = combinedActivity.slice(0, 10);

    res.json(combinedActivity);
  } catch (error) {
    console.error('[GET] /api/users/activity', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  } else if (diffHours > 0) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffMinutes > 0) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  } else {
    return 'just now';
  }
}

// Helper function to parse time ago for sorting
function parseTimeAgo(timeAgo) {
  const now = new Date();
  if (timeAgo === 'just now') {
    return 0;
  }
  
  const parts = timeAgo.split(' ');
  const value = parseInt(parts[0], 10);
  const unit = parts[1];
  
  if (unit.startsWith('minute')) {
    return value * 60 * 1000;
  } else if (unit.startsWith('hour')) {
    return value * 60 * 60 * 1000;
  } else if (unit.startsWith('day')) {
    return value * 24 * 60 * 60 * 1000;
  }
  
  return 0;
}
