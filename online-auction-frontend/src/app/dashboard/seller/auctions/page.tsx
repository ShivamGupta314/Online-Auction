'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  Clock, 
  DollarSign, 
  Filter, 
  Search
} from 'lucide-react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { getImageUrl } from '@/lib/imageUtils';

export default function SellerAuctionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const myAuctions = [
    {
      id: 1,
      title: 'Antique Wooden Chair',
      startingBid: '$200',
      currentBid: '$350',
      timeLeft: '2d 4h',
      image: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
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
      image: 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
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
      image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Accessories',
      bids: 7,
      status: 'active'
    },
    {
      id: 4,
      title: 'Vintage Record Player',
      startingBid: '$120',
      currentBid: '$180',
      timeLeft: 'Ended',
      image: 'https://images.unsplash.com/photo-1461360228754-6e81c478b882?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Electronics',
      bids: 4,
      status: 'completed'
    },
    {
      id: 5,
      title: 'Art Deco Wall Clock',
      startingBid: '$75',
      currentBid: '$75',
      timeLeft: 'Ended',
      image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Home Decor',
      bids: 0,
      status: 'expired'
    },
    {
      id: 6,
      title: 'Mechanical Wristwatch',
      startingBid: '$300',
      currentBid: '$450',
      timeLeft: 'Ended',
      image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Accessories',
      bids: 6,
      status: 'completed'
    },
  ];

  // Filter auctions based on search query and status
  const filteredAuctions = myAuctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         auction.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || auction.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <ProtectedRoute requiredRole="SELLER">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard/seller')}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">My Auctions</h1>
            <p className="text-gray-600 mt-2">Manage all your auction listings</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search auctions by title or category"
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="h-4 w-4 text-gray-500" />
                <Tabs 
                  defaultValue="all" 
                  value={filterStatus}
                  onValueChange={setFilterStatus}
                  className="w-full md:w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                    <TabsTrigger value="expired">Expired</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <Button onClick={() => router.push('/dashboard/seller/create')}>
                Create New Auction
              </Button>
            </div>
          </div>

          {filteredAuctions.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || filterStatus !== 'all' 
                  ? "Try adjusting your search or filter criteria" 
                  : "You haven't created any auctions yet"}
              </p>
              <Button onClick={() => router.push('/dashboard/seller/create')}>
                Create Your First Auction
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredAuctions.map((auction) => (
                <Card key={auction.id} className="bg-white hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                        <img
                          src={getImageUrl(auction.image)}
                          alt={auction.title}
                          className="object-cover w-full h-full"
                        />
                        <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-medium text-white
                          ${auction.status === 'active' ? 'bg-green-500' : 
                            auction.status === 'completed' ? 'bg-blue-500' : 'bg-gray-500'}`}
                        >
                          {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
                        </div>
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
                          {auction.status === 'active' && (
                            <Button variant="outline" size="sm">
                              Edit Auction
                            </Button>
                          )}
                          {auction.status === 'completed' && (
                            <Button variant="outline" size="sm">
                              View Winner
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
} 