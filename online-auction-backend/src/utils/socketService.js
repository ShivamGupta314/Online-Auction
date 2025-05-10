import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { prisma } from '../prismaClient.js';

dotenv.config();

let io;

/**
 * Initialize the Socket.IO server
 * @param {Object} httpServer - HTTP server instance
 */
export const initializeSocketIO = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow all origins for testing
      methods: ['GET', 'POST', 'OPTIONS'],
      credentials: false,
      allowedHeaders: ['Authorization', 'Content-Type']
    },
    transports: ['polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    path: '/socket.io/'
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      // Temporarily allow all connections for debugging
      console.log('Socket connection attempt - bypassing auth for debugging');
      socket.user = {
        id: 'debug-user',
        username: 'debug-user',
        email: 'debug@example.com',
        role: 'BIDDER'
      };
      
      next();
      
      /* Comment out normal authentication for now
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Verify the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Find the user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }
      
      // Store user info in socket object
      socket.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      };
      
      next();
      */
    } catch (error) {
      console.error('Socket authentication error:', error);
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.username} (${socket.user.id})`);
    
    // Join user to a personal room for direct messages
    socket.join(`user:${socket.user.id}`);
    
    // Handle joining auction rooms
    socket.on('join-auction', (auctionId) => {
      console.log(`${socket.user.username} joined auction room ${auctionId}`);
      socket.join(`auction:${auctionId}`);
    });
    
    // Handle leaving auction rooms
    socket.on('leave-auction', (auctionId) => {
      console.log(`${socket.user.username} left auction room ${auctionId}`);
      socket.leave(`auction:${auctionId}`);
    });
    
    // Handle disconnections
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });

  console.log('Socket.IO server initialized');
  return io;
};

/**
 * Get the Socket.IO instance
 * @returns {Object} Socket.IO instance
 */
export const getIO = () => {
  // In test environment, return a mock implementation
  if (process.env.NODE_ENV === 'test') {
    return {
      to: (room) => ({
        emit: (event, data) => {
          console.log(`[Test] Emitting ${event} to ${room} with data:`, data);
        }
      }),
      emit: (event, data) => {
        console.log(`[Test] Emitting ${event} with data:`, data);
      }
    };
  }
  
  if (!io) {
    throw new Error('Socket.IO not initialized. Call initializeSocketIO first.');
  }
  return io;
};

/**
 * Emit a new bid event to all clients in an auction room
 * @param {number} productId - Product ID
 * @param {Object} bid - Bid object
 * @param {Object} product - Product object
 */
export const emitNewBid = (productId, bid, product) => {
  try {
    const io = getIO();
    io.to(`auction:${productId}`).emit('new-bid', {
      bid: {
        id: bid.id,
        amount: bid.price,
        bidderUsername: bid.bidderUsername || 'Anonymous',
        bidderId: bid.bidderId,
        createdAt: bid.createdAt
      },
      currentPrice: bid.price,
      productId: productId,
      productName: product.name
    });
    
    console.log(`Emitted new bid event for product ${productId}`);
  } catch (error) {
    console.error('Error emitting new bid event:', error);
  }
};

/**
 * Emit an auction timer update to all clients in an auction room
 * @param {number} productId - Product ID
 * @param {number} timeRemaining - Time remaining in seconds
 */
export const emitAuctionTimer = (productId, timeRemaining) => {
  try {
    const io = getIO();
    io.to(`auction:${productId}`).emit('auction-timer', {
      productId,
      timeRemaining
    });
  } catch (error) {
    console.error('Error emitting auction timer event:', error);
  }
};

/**
 * Emit auction ended event to all clients in an auction room
 * @param {number} productId - Product ID
 * @param {Object} winningBid - Winning bid object (or null if no bids)
 */
export const emitAuctionEnded = (productId, winningBid) => {
  try {
    const io = getIO();
    io.to(`auction:${productId}`).emit('auction-ended', {
      productId,
      winningBid: winningBid ? {
        id: winningBid.id,
        amount: winningBid.price,
        bidderUsername: winningBid.bidderUsername || 'Anonymous',
        bidderId: winningBid.bidderId
      } : null
    });
    
    console.log(`Emitted auction ended event for product ${productId}`);
  } catch (error) {
    console.error('Error emitting auction ended event:', error);
  }
};

/**
 * Send a direct notification to a specific user
 * @param {number} userId - User ID
 * @param {string} type - Notification type
 * @param {Object} data - Notification data
 */
export const sendUserNotification = (userId, type, data) => {
  try {
    const io = getIO();
    io.to(`user:${userId}`).emit('notification', {
      type,
      ...data,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error sending user notification:', error);
  }
};

/**
 * Broadcast a notification to all connected users with a specific role
 * @param {string} role - User role (ADMIN, SELLER, BIDDER)
 * @param {string} type - Notification type
 * @param {Object} data - Notification data
 */
export const broadcastToRole = (role, type, data) => {
  try {
    const io = getIO();
    
    // For test environment, we just log the broadcast
    if (process.env.NODE_ENV === 'test') {
      console.log(`[Test] Broadcasting to role ${role}: ${type}`);
      return;
    }
    
    // Iterate through all connected sockets
    const sockets = Array.from(io.sockets.sockets.values());
    
    sockets.forEach((socket) => {
      if (socket.user && socket.user.role === role) {
        socket.emit('notification', {
          type,
          ...data,
          timestamp: new Date()
        });
      }
    });
    
    console.log(`Broadcast sent to all ${role} users`);
  } catch (error) {
    console.error('Error broadcasting to role:', error);
  }
};

export default {
  initializeSocketIO,
  getIO,
  emitNewBid,
  emitAuctionTimer,
  emitAuctionEnded,
  sendUserNotification,
  broadcastToRole
}; 