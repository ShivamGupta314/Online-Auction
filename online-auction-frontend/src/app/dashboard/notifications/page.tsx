'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Bell,
  CheckCircle2,
  AlertCircle,
  Info,
  Clock,
  Loader2,
  Menu,
  Package,
  Gavel,
  Heart,
  DollarSign,
} from 'lucide-react';
import { apiService } from '@/services/api';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { authService } from '@/services/auth';
import { SidebarContent } from '@/components/layout/SidebarContent';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Notification {
  id: string;
  type: 'bid' | 'auction' | 'system' | 'payment';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  data?: {
    auctionId?: string;
    amount?: number;
    status?: string;
  };
}

export default function NotificationsPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    setIsMounted(true);
    
    // Get user info
    const userInfo = authService.getUser();
    if (userInfo) {
      setUser(userInfo);
    }
    
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Fetch notifications from the API
        const data = await apiService.getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
        
        // Set default data if API fails
        setNotifications([
          {
            id: '1',
            type: 'bid',
            title: 'You Won an Auction!',
            message: 'Congratulations! You won the MacBook Pro 16 (M3) auction with a bid of ₹149,000.',
            timestamp: '2024-03-15T10:30:00Z',
            read: false,
            data: {
              auctionId: '1',
              amount: 149000
            }
          },
          {
            id: '2',
            type: 'auction',
            title: 'Auction Ending Soon',
            message: 'The iPhone 15 Pro auction is ending in 1 hour. Current highest bid: ₹89,000',
            timestamp: '2024-03-15T09:30:00Z',
            read: true,
            data: {
              auctionId: '2',
              amount: 89000
            }
          },
          {
            id: '3',
            type: 'system',
            title: 'Payment Successful',
            message: 'Your payment of ₹149,000 for MacBook Pro 16 (M3) has been processed successfully.',
            timestamp: '2024-03-15T08:30:00Z',
            read: true,
            data: {
              auctionId: '1',
              amount: 149000
            }
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
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

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      ));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'bid':
        return Gavel;
      case 'auction':
        return Package;
      case 'system':
        return Info;
      case 'payment':
        return DollarSign;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'bid':
        return 'bg-green-100 text-green-800';
      case 'auction':
        return 'bg-blue-100 text-blue-800';
      case 'system':
        return 'bg-purple-100 text-purple-800';
      case 'payment':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

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
                  <h1 className="text-2xl font-bold">Notifications</h1>
                  <p className="text-blue-100 text-sm">Stay updated with your auction activity</p>
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
                <Tabs defaultValue="all" className="space-y-6" onValueChange={setActiveTab}>
                  <TabsList className="bg-gray-100 p-1">
                    <TabsTrigger value="all" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="unread" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                      Unread
                    </TabsTrigger>
                    <TabsTrigger value="bid" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                      Bids
                    </TabsTrigger>
                    <TabsTrigger value="auction" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                      Auctions
                    </TabsTrigger>
                    <TabsTrigger value="payment" className="rounded-md data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm">
                      Payments
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value={activeTab}>
                    {isLoading ? (
                      <div className="space-y-4">
                        {Array(3).fill(0).map((_, index) => (
                          <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-3/4" />
                              <Skeleton className="h-4 w-1/2" />
                              <Skeleton className="h-4 w-1/4" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : filteredNotifications.length > 0 ? (
                      <ScrollArea className="h-[600px] pr-4">
                        <div className="space-y-4">
                          {filteredNotifications.map((notification) => {
                            const Icon = getNotificationIcon(notification.type);
                            const colorClass = getNotificationColor(notification.type);
                            
                            return (
                              <motion.div
                                key={notification.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex items-start space-x-4 p-4 rounded-lg transition-colors duration-200 ${
                                  notification.read ? 'bg-gray-50' : 'bg-blue-50'
                                }`}
                              >
                                <div className={`p-2 rounded-full ${colorClass}`}>
                                  <Icon className="h-6 w-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                                    {!notification.read && (
                                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                                        New
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-gray-600 mt-1">{notification.message}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-sm text-gray-500">
                                      {new Date(notification.timestamp).toLocaleString()}
                                    </span>
                                    <div className="flex items-center space-x-2">
                                      {notification.data?.auctionId && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                                          onClick={() => router.push(`/auctions/${notification.data.auctionId}`)}
                                        >
                                          View Auction
                                        </Button>
                                      )}
                                      {!notification.read && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="text-gray-500 hover:text-gray-700"
                                          onClick={() => handleMarkAsRead(notification.id)}
                                        >
                                          Mark as read
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="text-center py-12">
                        <Bell className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Notifications</h3>
                        <p className="text-gray-500 mb-6">You're all caught up! Check back later for updates.</p>
                        <Button 
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => router.push('/auctions')}
                        >
                          Browse Auctions
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 