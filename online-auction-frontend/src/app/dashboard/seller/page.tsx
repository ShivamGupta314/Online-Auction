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
  PlusCircle,
  Settings, 
  TrendingUp,
  User,
  Wallet
} from 'lucide-react';
import { authService } from '@/services/auth';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { useEffect } from 'react';
import { getImageUrl } from '@/lib/imageUtils';

export default function SellerDashboardPage() {
  const router = useRouter();

  // Redirect bidders to their specific dashboard
  useEffect(() => {
    if (authService.isBidder()) {
      router.push('/dashboard');
    }
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

  const stats = [
    { 
      title: 'Active Auctions', 
      value: '5', 
      change: '+2', 
      description: 'From last month',
      icon: <Gavel className="h-4 w-4 text-blue-500" />
    },
    { 
      title: 'Total Bids Received', 
      value: '48', 
      change: '+12', 
      description: 'From last month',
      icon: <TrendingUp className="h-4 w-4 text-green-500" />
    },
    { 
      title: 'Completed Auctions', 
      value: '12', 
      change: '+3', 
      description: 'From last month',
      icon: <Package className="h-4 w-4 text-purple-500" />
    },
    { 
      title: 'Total Revenue', 
      value: '$3,250', 
      change: '+$850', 
      description: 'From last month',
      icon: <DollarSign className="h-4 w-4 text-yellow-500" />
    },
  ];

  const myAuctions = [
    {
      id: 1,
      title: 'Antique Wooden Chair',
      startingBid: '$200',
      currentBid: '$350',
      timeLeft: '2d 4h',
      image: getImageUrl('https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
      category: 'Furniture',
      bids: 8,
      status: 'active'
    },
    {
      id: 2,
      title: 'Vintage Camera Collection',
      startingBid: '$150',
      currentBid: '$275',
      timeLeft: '1d 6h',
      image: getImageUrl('https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
      category: 'Electronics',
      bids: 5,
      status: 'active'
    },
    {
      id: 3,
      title: 'Handcrafted Leather Wallet',
      startingBid: '$50',
      currentBid: '$85',
      timeLeft: '8h 15m',
      image: getImageUrl('https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3'),
      category: 'Accessories',
      bids: 7,
      status: 'active'
    },
  ];

  return (
    <ProtectedRoute requiredRole="SELLER">
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900">AuctionHub</h2>
            <p className="text-sm text-gray-500 mt-1">Seller Dashboard</p>
          </div>
          <nav className="space-y-1 px-3">
            {[
              { icon: <Home className="h-5 w-5" />, label: 'Dashboard', href: '/dashboard/seller' },
              { icon: <Gavel className="h-5 w-5" />, label: 'My Auctions', href: '/dashboard/seller/auctions' },
              { icon: <PlusCircle className="h-5 w-5" />, label: 'Create Auction', href: '/dashboard/seller/create' },
              { icon: <Wallet className="h-5 w-5" />, label: 'Revenue', href: '/dashboard/seller/revenue' },
              { icon: <User className="h-5 w-5" />, label: 'Profile', href: '/profile' },
              { icon: <Settings className="h-5 w-5" />, label: 'Settings', href: '/settings' },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className="flex items-center space-x-3 w-full px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
          <div className="p-4 border-t mt-auto">
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <header className="bg-white border-b">
            <div className="px-6 py-4">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
                <Button onClick={() => router.push('/dashboard/seller/create')} className="bg-blue-600 hover:bg-blue-700">
                  Create New Auction
                </Button>
              </div>
            </div>
          </header>

          <main className="p-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => (
                <Card key={index} className="bg-white hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        {stat.title}
                      </CardTitle>
                      {stat.icon}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center text-sm">
                      <span className="text-green-600">{stat.change}</span>
                      <span className="text-gray-500 ml-2">{stat.description}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Tabs Section */}
            <Tabs defaultValue="auctions" className="space-y-6">
              <TabsList>
                <TabsTrigger value="auctions">My Auctions</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="analytics">Sales Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="auctions">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {myAuctions.map((auction) => (
                    <Card key={auction.id} className="bg-white hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex space-x-4">
                          <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                            <img
                              src={auction.image}
                              alt={auction.title}
                              className="object-cover w-full h-full"
                            />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900">{auction.title}</h3>
                              <span className="text-sm text-gray-500">{auction.category}</span>
                            </div>
                            <div className="mt-2 space-y-2">
                              <div className="flex items-center text-sm text-gray-500">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>Starting Bid: {auction.startingBid}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <DollarSign className="h-4 w-4 mr-1" />
                                <span>Current Bid: {auction.currentBid}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="h-4 w-4 mr-1" />
                                <span>Time Left: {auction.timeLeft}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-500">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                <span>Total Bids: {auction.bids}</span>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" size="sm">
                                View Details
                              </Button>
                              <Button variant="outline" size="sm">
                                Edit Auction
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="activity">
                <Card className="bg-white">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {[
                        { action: 'received a new bid', item: 'Antique Wooden Chair', time: '2 hours ago', amount: '$350' },
                        { action: 'auction ended', item: 'Vintage Pocket Watch', time: '1 day ago', amount: '$420 (Sold)' },
                        { action: 'created a new auction', item: 'Handcrafted Leather Wallet', time: '2 days ago', amount: 'Starting $50' },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className="w-2 h-2 mt-2 rounded-full bg-blue-600"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-900">
                                You {activity.action} for <span className="font-medium">{activity.item}</span>
                              </p>
                              <span className="text-sm font-medium text-gray-900">{activity.amount}</span>
                            </div>
                            <p className="text-xs text-gray-500">{activity.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics">
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Sales Analytics</CardTitle>
                    <CardDescription>Your sales performance over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      Analytics chart will be displayed here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 