'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Gavel, 
  Clock, 
  DollarSign, 
  Package,
  Loader2,
  Menu,
  Bell,
} from 'lucide-react';
import { apiService, Auction } from '@/services/api';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useEffect, useState } from 'react';
import { getImageUrl } from '@/lib/imageUtils';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { CountdownTimer } from '@/components/ui/countdown-timer';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authService } from '@/services/auth';
import { SidebarContent } from '@/components/layout/SidebarContent';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

interface Bid {
  id: string;
  amount: number;
  timestamp: string;
  status: 'active' | 'outbid' | 'won' | 'lost';
  auction: Auction;
}

export default function MyBidsPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeBids, setActiveBids] = useState<Bid[]>([]);
  const [outbidBids, setOutbidBids] = useState<Bid[]>([]);
  const [wonBids, setWonBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Get user info
    const userInfo = authService.getUser();
    if (userInfo) {
      setUser(userInfo);
    }
    
    const fetchBids = async () => {
      setIsLoading(true);
      try {
        // Fetch user's bids from the API
        const bids = await apiService.getUserBids();
        
        // Separate bids into different categories
        setActiveBids(bids.filter((bid: Bid) => bid.status === 'active'));
        setOutbidBids(bids.filter((bid: Bid) => bid.status === 'outbid'));
        setWonBids(bids.filter((bid: Bid) => bid.status === 'won'));
      } catch (error) {
        console.error('Error fetching bids:', error);
        toast.error('Failed to load your bids');
        
        // Set default data if API fails
        setActiveBids([
          {
            id: '1',
            amount: 149000,
            timestamp: '2024-03-15T10:30:00Z',
            status: 'active',
            auction: {
              id: '1',
              name: 'MacBook Pro 16 (M3)',
              description: 'Latest model with M3 chip',
              startPrice: 120000,
              currentPrice: 149000,
              endTime: '2024-03-20T12:00:00Z',
              photoUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2026&auto=format&fit=crop&ixlib=rb-4.0.3',
              category: { id: '1', name: 'Electronics' }
            }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBids();
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Failed to logout. Please try again.');
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
                  <h1 className="text-2xl font-bold">My Bids</h1>
                  <p className="text-blue-100 text-sm">Track and manage your bidding activity</p>
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
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Tabs defaultValue="active" className="space-y-6">
              <TabsList className="bg-gray-100 p-1">
                <TabsTrigger value="active" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  Active Bids
                </TabsTrigger>
                <TabsTrigger value="outbid" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  Outbid Items
                </TabsTrigger>
                <TabsTrigger value="won" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                  Won Auctions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-6">
                    {isLoading ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {Array(3).fill(0).map((_, index) => (
                          <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-0">
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
                    ) : activeBids.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {activeBids.map((bid) => (
                          <motion.div
                            key={bid.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={cardHover}
                          >
                            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-0">
                              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                                <img 
                                  src={getImageUrl(bid.auction.photoUrl)} 
                                  alt={bid.auction.name}
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
                                  <h3 className="font-semibold text-lg">{bid.auction.name}</h3>
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    Active
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500 mb-4">
                                  <span>Your bid: {formatCurrency(bid.amount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm text-gray-500">Current Price</p>
                                    <p className="text-xl font-bold text-blue-600">
                                      {formatCurrency(bid.auction.currentPrice)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-500">Time Left</p>
                                    <CountdownTimer endTime={bid.auction.endTime} auctionId={bid.auction.id} />
                                  </div>
                                </div>
                                <Button 
                                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
                                  onClick={() => router.push(`/auctions/${bid.auction.id}`)}
                                >
                                  Update Bid
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">You don't have any active bids.</p>
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

              <TabsContent value="outbid">
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-6">
                    {isLoading ? (
                      // Loading skeleton
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {Array(3).fill(0).map((_, index) => (
                          <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-0">
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
                    ) : outbidBids.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {outbidBids.map((bid) => (
                          <motion.div
                            key={bid.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={cardHover}
                          >
                            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-0">
                              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                                <img 
                                  src={getImageUrl(bid.auction.photoUrl)} 
                                  alt={bid.auction.name}
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
                                  <h3 className="font-semibold text-lg">{bid.auction.name}</h3>
                                  <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                                    Outbid
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500 mb-4">
                                  <span>Your bid: {formatCurrency(bid.amount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm text-gray-500">Current Price</p>
                                    <p className="text-xl font-bold text-blue-600">
                                      {formatCurrency(bid.auction.currentPrice)}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-gray-500">Time Left</p>
                                    <CountdownTimer endTime={bid.auction.endTime} auctionId={bid.auction.id} />
                                  </div>
                                </div>
                                <Button 
                                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
                                  onClick={() => router.push(`/auctions/${bid.auction.id}`)}
                                >
                                  Place New Bid
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">You haven't been outbid on any items.</p>
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

              <TabsContent value="won">
                <Card className="bg-white shadow-sm border-0">
                  <CardContent className="p-6">
                    {isLoading ? (
                      // Loading skeleton
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {Array(3).fill(0).map((_, index) => (
                          <Card key={index} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-0">
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
                    ) : wonBids.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {wonBids.map((bid) => (
                          <motion.div
                            key={bid.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={cardHover}
                          >
                            <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-0">
                              <div className="aspect-video w-full overflow-hidden bg-gray-100">
                                <img 
                                  src={getImageUrl(bid.auction.photoUrl)} 
                                  alt={bid.auction.name}
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
                                  <h3 className="font-semibold text-lg">{bid.auction.name}</h3>
                                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                    Won
                                  </Badge>
                                </div>
                                <div className="text-sm text-gray-500 mb-4">
                                  <span>Winning bid: {formatCurrency(bid.amount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="text-sm text-gray-500">Won On</p>
                                    <p className="text-xl font-bold text-blue-600">
                                      {new Date(bid.timestamp).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <Button 
                                  className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white" 
                                  onClick={() => router.push(`/auctions/${bid.auction.id}`)}
                                >
                                  View Details
                                </Button>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">You haven't won any auctions yet.</p>
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
        </main>
      </div>
    </ProtectedRoute>
  );
} 