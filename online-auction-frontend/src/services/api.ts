import { toast } from 'sonner';

// Backend API URL - use consistent port with socket service
const API_URL = 'http://localhost:5001/api';

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

export const apiService = {
  // Get live auctions for landing page
  async getLiveAuctions(): Promise<Auction[]> {
    try {
      const response = await fetch(`${API_URL}/products?status=active`, {
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
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
  async getUserStats(): Promise<{
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
  }> {
    try {
      console.log('Making API call to:', `${API_URL}/users/stats`);
      const response = await fetch(`${API_URL}/users/stats`, {
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching user stats:', error);
      // Return default values if API fails
      return {
        activeAuctions: 24,
        activeBids: 8,
        wonAuctions: 3,
        totalSpent: 85000,
        change: {
          activeAuctions: '+12%',
          activeBids: '+3%',
          wonAuctions: '+1%',
          totalSpent: '+5%'
        }
      };
    }
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
  async getUserActivity(): Promise<any[]> {
    try {
      const response = await fetch(`${API_URL}/users/activity`, {
        headers: getAuthHeaders(),
      });
      
      return handleResponse(response);
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  },

  // Add auction to watchlist
  async addToWatchlist(auctionId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_URL}/users/watchlist`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ auctionId }),
      });
      
      await handleResponse(response);
      toast.success('Added to watchlist');
      return { success: true };
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      toast.error('Failed to add to watchlist');
      return { success: false };
    }
  },

  // Remove auction from watchlist
  async removeFromWatchlist(auctionId: string): Promise<{ success: boolean }> {
    try {
      const response = await fetch(`${API_URL}/users/watchlist/${auctionId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      await handleResponse(response);
      toast.success('Removed from watchlist');
      return { success: true };
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove from watchlist');
      return { success: false };
    }
  }
}; 