'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  Clock, 
  DollarSign, 
  Gavel, 
  Home, 
  Package, 
  Settings, 
  TrendingUp,
  User,
  Wallet,
  Bell,
  Search,
  Loader2,
  Menu,
  X
} from 'lucide-react';
import { authService } from '@/services/auth';
import { apiService, Auction } from '@/services/api';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useEffect, useState } from 'react';
import { getImageUrl } from '@/lib/imageUtils';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

// Activity item interface
interface ActivityItem {
  id: string;
  action: string;
  item: string;
  time: string;
  amount: string;
  auctionId: string;
}

// Watchlist item interface
interface WatchlistItem {
  id: string;
  title: string;
  currentBid: number;
  timeLeft: string;
  image: string;
  endTime: string;
}

// User stats interface
interface UserStats {
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

// Add these new color constants
const sidebarColors = {
  background: 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900',
  hover: 'hover:bg-white/10',
  active: 'bg-white/15',
  border: 'border-slate-700/50',
  text: {
    primary: 'text-white',
    secondary: 'text-slate-400',
    hover: 'hover:text-white'
  }
};

export default function DashboardPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [liveAuctions, setLiveAuctions] = useState<Auction[]>([]);
  const [userActivity, setUserActivity] = useState<ActivityItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  
  const [isLoadingAuctions, setIsLoadingAuctions] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [isLoadingWatchlist, setIsLoadingWatchlist] = useState(true);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Sidebar animation variants
  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: '-100%', opacity: 0 }
  };

  // Card animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  useEffect(() => {
    setIsMounted(true);
    
    // Check API health first
    const checkApiHealth = async () => {
      try {
        console.log('Checking API health...');
        const response = await fetch('http://localhost:5001/api/health');
        const data = await response.json();
        console.log('API health check result:', data);
      } catch (error) {
        console.error('API health check failed:', error);
      }
    };
    checkApiHealth();
    
    // Redirect sellers to their specific dashboard
    if (authService.isSeller()) {
      router.push('/dashboard/seller');
      return;
    }

    // Get user info
    const userInfo = authService.getUser();
    if (userInfo) {
      setUser(userInfo);
    }

    // Fetch user stats
    const fetchUserStats = async () => {
      setIsLoadingStats(true);
      try {
        const stats = await apiService.getUserStats();
        setUserStats(stats);
      } catch (error) {
        console.error('Error fetching user stats:', error);
        toast.error('Failed to load your statistics');
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    // Fetch live auctions
    const fetchLiveAuctions = async () => {
      setIsLoadingAuctions(true);
      try {
        const auctions = await apiService.getLiveAuctions();
        setLiveAuctions(auctions.slice(0, 3)); // Get first 3 only
      } catch (error) {
        console.error('Error fetching live auctions:', error);
        toast.error('Failed to load live auctions');
      } finally {
        setIsLoadingAuctions(false);
      }
    };
    
    // Fetch user activity
    const fetchUserActivity = async () => {
      setIsLoadingActivity(true);
      try {
        const activity = await apiService.getUserActivity();
        setUserActivity(activity);
      } catch (error) {
        console.error('Error fetching user activity:', error);
        toast.error('Failed to load your activity');
        // Set default data if API fails
        setUserActivity([
          { id: '1', action: 'placed a bid', item: 'MacBook Pro 16 (M3)', time: '2 hours ago', amount: '₹149,000', auctionId: '1' },
          { id: '2', action: 'outbid by another user', item: 'iPhone 15 Pro Max', time: '5 hours ago', amount: '₹99,000', auctionId: '2' },
          { id: '3', action: 'won auction', item: 'Sony Alpha A7 IV Camera', time: '1 day ago', amount: '₹189,000', auctionId: '3' }
        ]);
      } finally {
        setIsLoadingActivity(false);
      }
    };
    
    // Fetch watchlist
    const fetchWatchlist = async () => {
      setIsLoadingWatchlist(true);
      try {
        const watchlistItems = await apiService.getUserWatchlist();
        setWatchlist(watchlistItems);
      } catch (error) {
        console.error('Error fetching watchlist:', error);
        toast.error('Failed to load your watchlist');
        // Set default data if API fails
        setWatchlist([
          { 
            id: '4',
            title: 'Bose QuietComfort Earbuds', 
            currentBid: 24900, 
            timeLeft: '1d 5h', 
            endTime: '2024-08-20T12:00:00Z',
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3'
          },
          { 
            id: '5',
            title: 'Samsung 55" QLED 4K Smart TV', 
            currentBid: 79990, 
            timeLeft: '2d 12h', 
            endTime: '2024-08-22T18:00:00Z',
            image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3'
          },
        ]);
      } finally {
        setIsLoadingWatchlist(false);
      }
    };
    
    // Fetch all data
    fetchUserStats();
    fetchLiveAuctions();
    fetchUserActivity();
    fetchWatchlist();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout. Please try again.');
    }
  };

  const handleRemoveFromWatchlist = async (itemId: string) => {
    try {
      await apiService.removeFromWatchlist(itemId);
      // Update watchlist state after removal
      setWatchlist(watchlist.filter(item => item.id !== itemId));
      toast.success('Item removed from watchlist');
    } catch (error) {
      console.error('Error removing from watchlist:', error);
      toast.error('Failed to remove from watchlist');
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Skip rendering until client-side hydration is complete
  if (!isMounted) {
    return null;
  }

  return (
    <ProtectedRoute requiredRole="BIDDER">
      <div className="min-h-screen bg-[#fafafa]">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white w-full"
        >
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Left side - Hamburger and Title */}
              <div className="flex items-center space-x-4">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                    >
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-72 bg-gradient-to-b from-blue-600 to-indigo-700 text-white border-0">
                    <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                    <SidebarContent user={user} onLogout={handleLogout} />
                  </SheetContent>
                </Sheet>
                <div>
                  <h1 className="text-2xl font-bold">Your Bidding Dashboard</h1>
                  <p className="text-blue-100 text-sm">Track your auctions, bids, and winning items</p>
                </div>
              </div>
              
              {/* Right side - Logo and User Profile */}
              <div className="flex items-center space-x-4">
                {/* Logo */}
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">A</span>
                  </div>
                  <span className="text-xl font-bold text-white">AuctionHub</span>
                </div>

                {/* User Profile */}
                <div className="flex items-center space-x-3 ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white hover:bg-white/10"
                    onClick={() => router.push('/notifications')}
                  >
                    <Bell className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={user?.profileImage || ''} alt={user?.username || 'User'} />
                      <AvatarFallback className="bg-white/10 text-white">
                        {user?.username?.substring(0, 2).toUpperCase() || 'UB'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
                      <p className="text-xs text-blue-100">Bidder Account</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="w-full">
          {/* Stats Cards */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  title: 'Active Auctions', 
                  value: userStats?.activeAuctions || 0, 
                  change: userStats?.change.activeAuctions || '+0%', 
                  description: 'From last month',
                  icon: <Gavel className="h-4 w-4 text-blue-500" />
                },
                { 
                  title: 'My Active Bids', 
                  value: userStats?.activeBids || 0, 
                  change: userStats?.change.activeBids || '+0%', 
                  description: 'From last month',
                  icon: <TrendingUp className="h-4 w-4 text-green-500" />
                },
                { 
                  title: 'Won Auctions', 
                  value: userStats?.wonAuctions || 0, 
                  change: userStats?.change.wonAuctions || '+0%', 
                  description: 'From last month',
                  icon: <Package className="h-4 w-4 text-purple-500" />
                },
                { 
                  title: 'Total Spent', 
                  value: formatCurrency(userStats?.totalSpent || 0), 
                  change: userStats?.change.totalSpent || '+0%', 
                  description: 'From last month',
                  icon: <DollarSign className="h-4 w-4 text-yellow-500" />
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial="hidden"
                  animate="visible"
                  variants={cardVariants}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card className="bg-white shadow-sm border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                          <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                          <p className="text-sm text-gray-500 mt-1">{stat.description}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-full">
                          {stat.icon}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center">
                        <span className={`text-sm font-medium ${
                          stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {stat.change}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tabs Section with styled tab list matching landing page */}
            <div className="mt-8">
              <Tabs defaultValue="auctions" className="space-y-6">
                <TabsList className="bg-gray-100 p-1">
                  <TabsTrigger value="auctions" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                    Live Auctions
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                    My Bidding Activity
                  </TabsTrigger>
                  <TabsTrigger value="watchlist" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                    My Watchlist
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="auctions">
                  {isLoadingAuctions ? (
                    // Loading skeleton for auctions
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {Array(3).fill(0).map((_, index) => (
                        <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-0 h-full">
                          <div className="aspect-video w-full overflow-hidden bg-gray-100">
                            <Skeleton className="w-full h-[220px]" />
                          </div>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-2">
                              <Skeleton className="h-6 w-32" />
                              <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-24 mb-4" />
                            <div className="flex justify-between items-center mb-4">
                              <div>
                                <Skeleton className="h-4 w-20 mb-1" />
                                <Skeleton className="h-6 w-24" />
                              </div>
                              <div className="text-right">
                                <Skeleton className="h-4 w-16 mb-1" />
                                <Skeleton className="h-6 w-20" />
                              </div>
                            </div>
                            <Skeleton className="h-10 w-full" />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {liveAuctions.length > 0 ? liveAuctions.map((auction, index) => (
                        <motion.div
                          key={auction.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                          <motion.div whileHover={cardHover}>
                            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-0 h-full">
                              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                                <img 
                                  src={getImageUrl(auction.photoUrl)} 
                                  alt={auction.name}
                                  className="w-full h-full object-cover"
                                  style={{ 
                                    height: "220px",
                                    objectFit: "cover",
                                    width: "100%"
                                  }}
                                  loading="lazy"
                                />
                              </div>
                              <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-2">
                                  <h3 className="font-semibold text-lg">{auction.name}</h3>
                                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                    {auction.category?.name || 'Item'}
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500 mb-4">
                                  <span>Bids: {auction.bids?.length || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm text-gray-500">Current Bid</p>
                                    <p className="text-xl font-bold text-blue-600">
                                      {formatCurrency(auction.highestBid || auction.minBidPrice)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-500">Time Left</p>
                                    <CountdownTimer endTime={auction.endTime} auctionId={auction.id} />
                                  </div>
                                </div>
                                <Button 
                                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
                                  onClick={() => router.push(`/auctions/${auction.id}`)}
                                >
                                  Place Bid
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </motion.div>
                      )) : (
                        <div className="col-span-3 text-center py-12">
                          <p className="text-gray-500">No live auctions available at the moment.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => router.push('/auctions')}
                          >
                            Browse All Auctions
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {liveAuctions.length > 0 && (
                    <div className="mt-6 text-center">
                      <Button 
                        variant="outline" 
                        className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        onClick={() => router.push('/auctions')}
                      >
                        View All Auctions
                      </Button>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="activity">
                  <Card className="bg-white shadow-sm border-0">
                    <CardContent className="p-6">
                      {isLoadingActivity ? (
                        // Loading skeleton for activity
                        <div className="space-y-6">
                          {Array(3).fill(0).map((_, index) => (
                            <div key={index} className="flex items-start space-x-4 p-4 rounded-lg">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <Skeleton className="h-5 w-32 mb-2" />
                                  <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-4 w-48 mb-2" />
                                <Skeleton className="h-5 w-24" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : userActivity.length > 0 ? (
                        <div className="space-y-6">
                          {userActivity.map((activity, index) => (
                            <motion.div 
                              key={index} 
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50"
                            >
                              <div className={`p-2 rounded-full ${
                                activity.action === 'placed a bid' 
                                  ? 'bg-blue-100 text-blue-600' 
                                  : activity.action === 'outbid by another user'
                                    ? 'bg-amber-100 text-amber-600'
                                    : 'bg-green-100 text-green-600'
                              }`}>
                                {activity.action === 'placed a bid' 
                                  ? <TrendingUp className="h-5 w-5" />
                                  : activity.action === 'outbid by another user'
                                    ? <Bell className="h-5 w-5" />
                                    : <Package className="h-5 w-5" />
                                }
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between">
                                  <p className="font-medium">You {activity.action}</p>
                                  <span className="text-sm text-gray-500">{activity.time}</span>
                                </div>
                                <p className="text-gray-700">{activity.item}</p>
                                <p className="text-blue-600 font-medium">{activity.amount}</p>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500">No bidding activity yet.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => router.push('/auctions')}
                          >
                            Start Bidding
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="watchlist">
                  <Card className="bg-white shadow-sm border-0">
                    <CardContent className="p-6">
                      {isLoadingWatchlist ? (
                        // Loading skeleton for watchlist
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Array(2).fill(0).map((_, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg overflow-hidden flex">
                              <div className="w-1/3">
                                <Skeleton className="w-full h-full min-h-28" />
                              </div>
                              <div className="p-4 w-2/3">
                                <Skeleton className="h-5 w-40 mb-2" />
                                <div className="mt-2 space-y-2">
                                  <div className="flex justify-between text-sm">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-4 w-16" />
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-12" />
                                  </div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                  <Skeleton className="h-7 w-16" />
                                  <Skeleton className="h-7 w-16" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : watchlist.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {watchlist.map((item, index) => (
                            <motion.div 
                              key={item.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                              whileHover={{ scale: 1.02 }}
                              className="bg-gray-50 rounded-lg overflow-hidden flex"
                            >
                              <div className="w-1/3">
                                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                              </div>
                              <div className="p-4 w-2/3">
                                <h4 className="font-medium text-gray-900">{item.title}</h4>
                                <div className="mt-2 space-y-1">
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Current bid:</span>
                                    <span className="font-medium text-blue-600">{formatCurrency(item.currentBid)}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Time left:</span>
                                    <span>{item.timeLeft}</span>
                                  </div>
                                </div>
                                <div className="mt-3 flex gap-2">
                                  <Button 
                                    size="sm" 
                                    className="text-xs py-0 px-2 h-7"
                                    onClick={() => router.push(`/auctions/${item.id}`)}
                                  >
                                    Place Bid
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="text-xs py-0 px-2 h-7"
                                    onClick={() => handleRemoveFromWatchlist(item.id)}
                                  >
                                    Remove
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500">Your watchlist is empty.</p>
                          <Button 
                            variant="outline" 
                            className="mt-4 border-blue-200 text-blue-600 hover:bg-blue-50"
                            onClick={() => router.push('/auctions')}
                          >
                            Browse Auctions
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}

// Update the SidebarContent component
function SidebarContent({ user, onLogout }: { user: any; onLogout: () => void }) {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('Dashboard');

  const menuItems = [
    { icon: <Home className="h-5 w-5" />, label: 'Dashboard', href: '/dashboard' },
    { icon: <Gavel className="h-5 w-5" />, label: 'My Bids', href: '/dashboard/bids' },
    { icon: <Package className="h-5 w-5" />, label: 'Won Auctions', href: '/dashboard/won' },
    { icon: <Bell className="h-5 w-5" />, label: 'Notifications', href: '/dashboard/notifications' },
    { icon: <User className="h-5 w-5" />, label: 'Profile', href: '/profile' },
    { icon: <Settings className="h-5 w-5" />, label: 'Settings', href: '/settings' },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center space-x-3"
        >
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">A</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AuctionHub</h2>
            <p className="text-sm text-white/70">Welcome back, {user?.username || 'Bidder'}</p>
          </div>
        </motion.div>
      </div>
      
      <div className="pt-4 pb-2 px-4">
        <nav className="space-y-1">
          {menuItems.map((item, index) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * index }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setActiveItem(item.label);
                router.push(item.href);
              }}
              className={cn(
                "flex items-center space-x-3 w-full px-3 py-2.5 rounded-lg transition-colors",
                activeItem === item.label
                  ? "bg-white/20 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
            onClick={onLogout}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
} 


