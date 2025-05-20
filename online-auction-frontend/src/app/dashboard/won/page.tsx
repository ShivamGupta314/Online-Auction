'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Package,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle2,
  Clock,
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
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authService } from '@/services/auth';
import { SidebarContent } from '@/components/layout/SidebarContent';
import { Progress } from '@/components/ui/progress';

interface WonAuction {
  id: string;
  amount: number;
  timestamp: string;
  status: 'processing' | 'shipped' | 'delivered';
  auction: Auction;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export default function WonAuctionsPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [wonAuctions, setWonAuctions] = useState<WonAuction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    // Get user info
    const userInfo = authService.getUser();
    if (userInfo) {
      setUser(userInfo);
    }
    
    const fetchWonAuctions = async () => {
      setIsLoading(true);
      try {
        // Fetch won auctions from the API
        const auctions = await apiService.getWonAuctions();
        setWonAuctions(auctions);
      } catch (error) {
        console.error('Error fetching won auctions:', error);
        toast.error('Failed to load won auctions');
        
        // Set default data if API fails
        setWonAuctions([
          {
            id: '1',
            amount: 149000,
            timestamp: '2024-03-15T10:30:00Z',
            status: 'processing',
            auction: {
              id: '1',
              name: 'MacBook Pro 16 (M3)',
              description: 'Latest model with M3 chip',
              startPrice: 120000,
              currentPrice: 149000,
              endTime: '2024-03-20T12:00:00Z',
              photoUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2026&auto=format&fit=crop&ixlib=rb-4.0.3',
              category: { id: '1', name: 'Electronics' }
            },
            estimatedDelivery: '2024-03-25'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWonAuctions();
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

  // Get status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'processing':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          text: 'Processing'
        };
      case 'shipped':
        return {
          color: 'bg-purple-100 text-purple-800',
          icon: Truck,
          text: 'Shipped'
        };
      case 'delivered':
        return {
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle2,
          text: 'Delivered'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: Package,
          text: 'Unknown'
        };
    }
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
                  <h1 className="text-2xl font-bold">Won Auctions</h1>
                  <p className="text-blue-100 text-sm">Track your winning items and their delivery status</p>
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
            <Card className="bg-white shadow-sm border-0">
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Array(2).fill(0).map((_, index) => (
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
                ) : wonAuctions.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {wonAuctions.map((auction) => {
                      const statusInfo = getStatusInfo(auction.status);
                      const StatusIcon = statusInfo.icon;
                      
                      return (
                        <motion.div
                          key={auction.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover={{ scale: 1.02 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow border-0">
                            <div className="aspect-video w-full overflow-hidden bg-gray-100">
                              <img 
                                src={getImageUrl(auction.auction.photoUrl)} 
                                alt={auction.auction.name}
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
                              <div className="flex justify-between items-start mb-4">
                                <h3 className="font-semibold text-lg">{auction.auction.name}</h3>
                                <Badge className={`${statusInfo.color} hover:${statusInfo.color}`}>
                                  <StatusIcon className="w-4 h-4 mr-1" />
                                  {statusInfo.text}
                                </Badge>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center text-gray-500">
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    <span>Winning Bid</span>
                                  </div>
                                  <span className="font-semibold text-blue-600">
                                    {formatCurrency(auction.amount)}
                                  </span>
                                </div>
                                
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center text-gray-500">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    <span>Won On</span>
                                  </div>
                                  <span className="font-medium">
                                    {new Date(auction.timestamp).toLocaleDateString()}
                                  </span>
                                </div>

                                {auction.estimatedDelivery && (
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center text-gray-500">
                                      <Truck className="w-4 h-4 mr-2" />
                                      <span>Estimated Delivery</span>
                                    </div>
                                    <span className="font-medium">
                                      {new Date(auction.estimatedDelivery).toLocaleDateString()}
                                    </span>
                                  </div>
                                )}

                                {auction.trackingNumber && (
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center text-gray-500">
                                      <Package className="w-4 h-4 mr-2" />
                                      <span>Tracking Number</span>
                                    </div>
                                    <span className="font-medium text-blue-600">
                                      {auction.trackingNumber}
                                    </span>
                                  </div>
                                )}

                                {/* Delivery Progress */}
                                <div className="mt-4">
                                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                                    <span>Delivery Progress</span>
                                    <span>{auction.status === 'delivered' ? '100%' : auction.status === 'shipped' ? '75%' : '25%'}</span>
                                  </div>
                                  <Progress 
                                    value={auction.status === 'delivered' ? 100 : auction.status === 'shipped' ? 75 : 25} 
                                    className="h-2"
                                  />
                                </div>
                              </div>

                              <div className="mt-6 space-x-3">
                                <Button 
                                  className="bg-blue-600 hover:bg-blue-700 text-white"
                                  onClick={() => router.push(`/auctions/${auction.auction.id}`)}
                                >
                                  View Details
                                </Button>
                                {auction.trackingNumber && (
                                  <Button 
                                    variant="outline"
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                    onClick={() => window.open(`https://tracking.example.com/${auction.trackingNumber}`, '_blank')}
                                  >
                                    Track Package
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Won Auctions Yet</h3>
                    <p className="text-gray-500 mb-6">Start bidding on auctions to win amazing items!</p>
                    <Button 
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => router.push('/auctions')}
                    >
                      Browse Auctions
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 