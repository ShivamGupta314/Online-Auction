import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';

// Use the environment variable for the socket URL
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

class SocketService {
  private socket: Socket | null = null;
  private auctionTimers: Map<string, number> = new Map();
  private timerCallbacks: Map<string, (timeRemaining: number) => void> = new Map();
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private fallbackMode = false;

  // Initialize socket connection
  connect() {
    if (this.socket) return;

    try {
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        console.log('Maximum connection attempts reached, using fallback mode');
        this.fallbackMode = true;
        return;
      }

      this.connectionAttempts++;
      
      console.log('Attempting to connect to Socket.IO server at:', SOCKET_URL);
      
      // Create a simplified socket connection with minimal options
      this.socket = io(SOCKET_URL, {
        transports: ['polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        path: '/socket.io/'
      });

      this.setupEventListeners();
      console.log('Socket connection initialized with simplified options');
    } catch (error) {
      console.error('Socket connection error:', error);
      this.fallbackMode = true;
    }
  }

  // Disconnect socket
  disconnect() {
    if (!this.socket) return;
    
    this.socket.disconnect();
    this.socket = null;
    this.auctionTimers.clear();
    this.timerCallbacks.clear();
    console.log('Socket disconnected');
  }

  // Set up event listeners
  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected with ID:', this.socket?.id);
      this.connectionAttempts = 0; // Reset connection attempts on successful connection
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      
      // If we've reached max attempts, disconnect and use fallback mode
      if (this.connectionAttempts >= this.maxConnectionAttempts) {
        console.log('Maximum connection attempts reached, switching to fallback mode');
        this.disconnect();
      }
    });

    // Handle transport errors specifically
    this.socket.io.on("error", (error) => {
      console.error('Transport error:', error);
    });

    // Listen for auction timer updates
    this.socket.on('auction-timer', (data) => {
      const { productId, timeRemaining } = data;
      
      // Store the time remaining
      this.auctionTimers.set(productId, timeRemaining);
      
      // Call the callback if registered
      const callback = this.timerCallbacks.get(productId);
      if (callback) {
        callback(timeRemaining);
      }
    });

    // Listen for new bids
    this.socket.on('new-bid', (data) => {
      toast.info(`New bid: $${data.amount} on ${data.productName}`);
    });

    // Listen for auction ended
    this.socket.on('auction-ended', (data) => {
      toast.success(`Auction ended: ${data.productName}`);
    });

    // Listen for notifications
    this.socket.on('notification', (data) => {
      toast.info(data.message);
    });
  }

  // Join an auction room to receive updates
  joinAuction(auctionId: string) {
    if (!this.socket) {
      this.connect();
    }

    if (this.socket && this.socket.connected) {
      this.socket.emit('join-auction', auctionId);
      console.log(`Joined auction room: ${auctionId}`);
    } else {
      console.log(`Socket not connected, using fallback for auction ${auctionId}`);
    }
  }

  // Leave an auction room
  leaveAuction(auctionId: string) {
    if (!this.socket || !this.socket.connected) return;

    this.socket.emit('leave-auction', auctionId);
    console.log(`Left auction room: ${auctionId}`);
  }

  // Register a callback for timer updates
  registerTimerCallback(auctionId: string, callback: (timeRemaining: number) => void) {
    this.timerCallbacks.set(auctionId, callback);
  }

  // Unregister a timer callback
  unregisterTimerCallback(auctionId: string) {
    this.timerCallbacks.delete(auctionId);
  }

  // Get the current time remaining for an auction
  getTimeRemaining(auctionId: string): number | null {
    return this.auctionTimers.get(auctionId) || null;
  }

  // Request timer update for an auction
  requestTimerUpdate(auctionId: string) {
    // Always use local timer for now until we fix the socket issues
    console.log(`Using local timer for auction ${auctionId}`);
  }

  // Check if socket is connected
  isConnected(): boolean {
    return !this.fallbackMode && !!this.socket && this.socket.connected;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService; 