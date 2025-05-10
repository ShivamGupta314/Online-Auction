'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  BarChart3, 
  Clock, 
  DollarSign, 
  Filter, 
  Search,
  SlidersHorizontal
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function AuctionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [showFilters, setShowFilters] = useState(false);
  
  const auctions = [
    {
      id: 1,
      title: 'Antique Wooden Chair',
      startingBid: '$200',
      currentBid: '$350',
      timeLeft: '2d 4h',
      image: 'https://images.unsplash.com/photo-1549187774-b4e9b0445b41?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Furniture',
      bids: 8,
      seller: 'VintageFinds',
      description: 'Beautiful hand-carved wooden chair from the early 1900s. Excellent condition with minor wear consistent with age.'
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
      seller: 'RetroTech',
      description: 'Collection of 5 vintage cameras from the 1950s-1970s. All in working condition with original cases.'
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
      seller: 'LeatherCrafts',
      description: 'Handmade genuine leather wallet with multiple card slots and bill compartment. Made with premium materials.'
    },
    {
      id: 4,
      title: 'Art Deco Table Lamp',
      startingBid: '$120',
      currentBid: '$180',
      timeLeft: '3d 12h',
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Home Decor',
      bids: 4,
      seller: 'ArtDecoTreasures',
      description: 'Elegant Art Deco style table lamp with stained glass shade. Fully restored and rewired.'
    },
    {
      id: 5,
      title: 'Vintage Vinyl Records Collection',
      startingBid: '$75',
      currentBid: '$95',
      timeLeft: '4d 8h',
      image: 'https://images.unsplash.com/photo-1603048588665-791ca91d0e92?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Music',
      bids: 3,
      seller: 'VinylVault',
      description: 'Collection of 20 classic rock vinyl records from the 1970s. All in excellent condition with original sleeves.'
    },
    {
      id: 6,
      title: 'Mechanical Wristwatch',
      startingBid: '$300',
      currentBid: '$450',
      timeLeft: '2d 18h',
      image: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Accessories',
      bids: 6,
      seller: 'TimelessPieces',
      description: 'Luxury mechanical wristwatch with leather strap. Swiss movement, sapphire crystal, and exhibition case back.'
    },
    {
      id: 7,
      title: 'Vintage Comic Book Collection',
      startingBid: '$250',
      currentBid: '$320',
      timeLeft: '5d 10h',
      image: 'https://images.unsplash.com/photo-1612036782180-6f0822045d55?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Collectibles',
      bids: 5,
      seller: 'ComicTreasures',
      description: 'Collection of 15 rare comic books from the 1980s. All bagged and boarded in near mint condition.'
    },
    {
      id: 8,
      title: 'Antique Silver Tea Set',
      startingBid: '$400',
      currentBid: '$550',
      timeLeft: '3d 6h',
      image: 'https://images.unsplash.com/photo-1603902142213-9c66c8769db0?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
      category: 'Home Decor',
      bids: 7,
      seller: 'SilverAntiques',
      description: 'Complete sterling silver tea service from the 1920s. Includes teapot, creamer, sugar bowl, and tray.'
    },
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'home-decor', label: 'Home Decor' },
    { value: 'music', label: 'Music' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'art', label: 'Art' },
    { value: 'jewelry', label: 'Jewelry' },
  ];

  // Filter auctions based on search query and category
  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         auction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         auction.seller.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || 
                           auction.category.toLowerCase() === filterCategory.toLowerCase();
    
    const currentBidValue = parseInt(auction.currentBid.replace('$', ''));
    const matchesPriceRange = currentBidValue >= priceRange[0] && currentBidValue <= priceRange[1];
    
    return matchesSearch && matchesCategory && matchesPriceRange;
  });

  const handlePriceRangeChange = (value: number[]) => {
    setPriceRange(value);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Browse Auctions</h1>
          <p className="text-gray-600 mt-2">Discover unique items and place your bids</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search auctions by title, description, or seller"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Select
                value={filterCategory}
                onValueChange={setFilterCategory}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showFilters ? 'Hide Filters' : 'More Filters'}
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="mt-6 pt-6 border-t">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Price Range</Label>
                    <div className="text-sm text-gray-500">
                      ${priceRange[0]} - ${priceRange[1]}
                    </div>
                  </div>
                  <Slider
                    defaultValue={[0, 1000]}
                    max={1000}
                    step={10}
                    value={priceRange}
                    onValueChange={handlePriceRangeChange}
                    className="w-full"
                  />
                </div>
                
                <Tabs defaultValue="all">
                  <TabsList>
                    <TabsTrigger value="all">All Items</TabsTrigger>
                    <TabsTrigger value="ending-soon">Ending Soon</TabsTrigger>
                    <TabsTrigger value="newly-listed">Newly Listed</TabsTrigger>
                    <TabsTrigger value="high-bids">High Bids</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>
          )}
        </div>

        {filteredAuctions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">No auctions found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filter criteria
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setFilterCategory('all');
              setPriceRange([0, 1000]);
            }}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map((auction) => (
              <Card key={auction.id} className="bg-white hover:shadow-lg transition-shadow overflow-hidden">
                <div className="relative h-48 w-full">
                  <img
                    src={auction.image}
                    alt={auction.title}
                    className="object-cover w-full h-full"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{auction.title}</h3>
                    <span className="text-sm text-gray-500">{auction.category}</span>
                  </div>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{auction.description}</p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>Current Bid: <span className="font-medium">{auction.currentBid}</span></span>
                      </div>
                      <div className="flex items-center text-gray-500">
                        <BarChart3 className="h-4 w-4 mr-1" />
                        <span>Bids: {auction.bids}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Time Left: <span className="font-medium">{auction.timeLeft}</span></span>
                      </div>
                      <span className="text-sm text-gray-500">Seller: {auction.seller}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button className="w-full" onClick={() => router.push('/login')}>Place Bid</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center">
          <Button variant="outline">Load More</Button>
        </div>
      </div>
    </div>
  );
} 