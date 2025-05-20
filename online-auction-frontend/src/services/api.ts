import { toast } from 'sonner';
import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Backend API URL - use consistent port with socket service
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  console.log('API Response:', response.status, response.statusText, response.url);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ 
      message: 'An unknown error occurred' 
    }));
    console.error('API Error:', errorData);
    throw new Error(errorData.message || 'API request failed');
  }
  return response.json();
};

// Helper function to get headers with auth token
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  console.log('Auth token:', token);
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  console.log('Request headers:', headers);
  return headers;
};

export interface Auction {
  id: string;
  name: string;
  description: string;
  photoUrl: string;
  minBidPrice: number;
  startTime: string;
  endTime: string;
  categoryId: number;
  sellerId: string;
  createdAt: string;
  updatedAt: string;
  highestBid?: number;
  isExpired?: boolean;
  timeLeft?: number;
  timeLeftFormatted?: string;
  category?: {
    id: number;
    name: string;
  };
  seller?: {
    id: string;
    username: string;
  };
  bids?: Array<{
    id: string;
    price: number;
    createdAt: string;
    bidder: {
      username: string;
    };
  }>;
}

export interface NewsletterSubscription {
  email: string;
}

export interface UserStats {
  activeAuctions: number;
  activeBids: number;
  wonAuctions: number;
  totalSpent: number;
  change: {
    activeAuctions: string;
    activeBids: string;
    wonAuctions: string;
    totalSpent: string;
  }
}

export interface ActivityItem {
  id: string;
  action: string;
  item: string;
  time: string;
  amount: string;
  auctionId: string;
}

export interface WatchlistItem {
  id: string;
  title: string;
  currentBid: number;
  timeLeft: string;
  endTime: string;
  image: string;
}

export const apiService = {
  // Get live auctions for landing page
  async getLiveAuctions(): Promise<Auction[]> {
    try {
      const response = await api.get('/products', {
        params: {
          status: 'active',
          sort: 'endTime',
          order: 'asc'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching live auctions:', error);
      toast.error('Failed to load live auctions');
      return [];
    }
  },

  // Get upcoming auctions for landing page
  async getUpcomingAuctions(): Promise<Auction[]> {
    try {
      console.log('Making API call to:', `${API_URL}/products?status=upcoming`);
      const response = await fetch(`${API_URL}/products?status=upcoming`, {
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching upcoming auctions:', error);
      toast.error('Failed to load upcoming auctions');
      return [];
    }
  },

  // Get closed/ended auctions for landing page
  async getClosedAuctions(): Promise<Auction[]> {
    try {
      console.log('Making API call to:', `${API_URL}/products?status=ended`);
      const response = await fetch(`${API_URL}/products?status=ended`, {
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching closed auctions:', error);
      toast.error('Failed to load closed auctions');
      return [];
    }
  },

  // Subscribe to newsletter
  async subscribeToNewsletter(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const result = await handleResponse(response);
      toast.success('Successfully subscribed to newsletter!');
      return { success: true, message: 'Successfully subscribed!' };
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('Failed to subscribe to newsletter');
      return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
    }
  },

  // Get auction statistics for the landing page
  async getAuctionStatistics(): Promise<{ 
    averageDiscount: number; 
    totalCustomers: number;
    totalSavings: number;
  }> {
    try {
      const response = await fetch(`${API_URL}/products/statistics`, {
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching auction statistics:', error);
      // Return default values if API fails
      return {
        averageDiscount: 85,
        totalCustomers: 10000,
        totalSavings: 50000000
      };
    }
  },
  
  // Get auction timer
  async getAuctionTimer(auctionId: string): Promise<{ timeRemaining: number }> {
    try {
      const response = await fetch(`${API_URL}/products/${auctionId}/timer`, {
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching auction timer:', error);
      return { timeRemaining: 0 };
    }
  },

  // Get dashboard user statistics
  async getUserStats(): Promise<UserStats> {
    const response = await api.get('/users/stats');
    return response.data;
  },

  // Get user's active bids
  async getUserActiveBids(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/bids/user`, {
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching user active bids:', error);
      return [];
    }
  },

  // Get user's won auctions
  async getUserWonAuctions(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/users/won-auctions`, {
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching user won auctions:', error);
      return [];
    }
  },

  // Get user's watchlist
  async getUserWatchlist(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/users/watchlist`, {
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching user watchlist:', error);
      return [];
    }
  },

  // Get user's recent activity
  async getUserActivity(): Promise<ActivityItem[]> {
    const response = await api.get('/users/activity');
    return response.data;
  },

  // Add auction to watchlist
  async addToWatchlist(auctionId: string): Promise<void> {
    await api.post('/users/watchlist', { auctionId });
  },

  // Remove auction from watchlist
  async removeFromWatchlist(auctionId: string): Promise<void> {
    await api.delete(`/users/watchlist/${auctionId}`);
  },

  // Get watchlist
  async getWatchlist(): Promise<WatchlistItem[]> {
    const response = await api.get('/users/watchlist');
    return response.data;
  },

  // Place bid
  async placeBid(auctionId: string, amount: number): Promise<void> {
    await api.post('/bids', {
      productId: auctionId,
      price: amount
    });
  },

  // Get my bids
  async getMyBids(): Promise<Auction[]> {
    const response = await api.get('/bids/user');
    return response.data;
  },

  // Get won auctions
  async getWonAuctions(): Promise<Auction[]> {
    const response = await api.get('/users/won-auctions');
    return response.data;
  },

  // Get notifications
  async getNotifications(): Promise<any[]> {
    const response = await api.get('/notifications');
    return response.data;
  },

  // Mark notification as read
  async markNotificationAsRead(notificationId: string): Promise<void> {
    await api.put(`/notifications/${notificationId}/read`);
  },

  // Health check
  async checkHealth(): Promise<boolean> {
    try {
      const response = await api.get('/health');
      return response.status === 200;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}; 