import express from 'express'
import authMiddleware from '../middleware/auth.middleware.js'
import { 
  assignPackage, 
  getUserPackages, 
  getUserStats, 
  getUserWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  getUserWonAuctions,
  getUserActivity
} from '../controllers/user.controller.js'

const router = express.Router()

// Package routes
router.post('/:id/packages', authMiddleware, assignPackage)
router.get('/:id/packages', authMiddleware, getUserPackages)

// User dashboard routes
router.get('/stats', authMiddleware, getUserStats)
router.get('/watchlist', authMiddleware, getUserWatchlist)
router.post('/watchlist', authMiddleware, addToWatchlist)
router.delete('/watchlist/:auctionId', authMiddleware, removeFromWatchlist)
router.get('/won-auctions', authMiddleware, getUserWonAuctions)
router.get('/activity', authMiddleware, getUserActivity)

export default router
