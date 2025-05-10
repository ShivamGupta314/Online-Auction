'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { apiService, Auction } from '@/services/api';
import { toast } from 'sonner';
import socketService from '@/services/socketService';
import { CountdownTimer } from '@/components/ui/countdown-timer';

// Performance optimized animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

const cardHover = {
  scale: 1.02,
  transition: { duration: 0.2 }
};

// Ensure client-side only rendering with no hydration mismatch
const HomePage = () => {
  const router = useRouter();
  const [showAllAuctions, setShowAllAuctions] = useState(false);
  const additionalAuctionsRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [statistics, setStatistics] = useState({
    averageDiscount: 85,
    totalCustomers: 10000,
    totalSavings: 50000000
  });
  const [liveAuctions, setLiveAuctions] = useState<Auction[]>([]);
  const [upcomingAuctions, setUpcomingAuctions] = useState<Auction[]>([]);
  const [closedAuctions, setClosedAuctions] = useState<Auction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Set mounted state to true when component mounts
  useEffect(() => {
    setIsMounted(true);
    
    // Fetch statistics when component mounts
    const fetchStatistics = async () => {
      try {
        const stats = await apiService.getAuctionStatistics();
        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching statistics:', error);
        // Keep default values if API fails
      }
    };
    
    // Fetch auctions data
    const fetchAuctionsData = async () => {
      setIsLoading(true);
      try {
        // Fetch live auctions
        const live = await apiService.getLiveAuctions();
        setLiveAuctions(live.slice(0, 6)); // Limit to 6 auctions for display
        
        // Fetch upcoming auctions
        const upcoming = await apiService.getUpcomingAuctions();
        setUpcomingAuctions(upcoming.slice(0, 2)); // Limit to 2 upcoming auctions
        
        // Fetch closed auctions
        const closed = await apiService.getClosedAuctions();
        setClosedAuctions(closed.slice(0, 2)); // Limit to 2 closed auctions
      } catch (error) {
        console.error('Error fetching auctions data:', error);
        // Keep default values if API fails
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStatistics();
    fetchAuctionsData();
  }, []);

  // Carousel data
  const carouselItems = [
    {
      title: "Exclusive Auctions",
      description: "Win big with up to 85% discounts on brand new products!",
      image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      color: "from-blue-600 to-indigo-700"
    },
    {
      title: "Premium Electronics",
      description: "Bid on the latest gadgets and tech at unbeatable prices!",
      image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      color: "from-purple-600 to-pink-700"
    },
    {
      title: "Luxury Collections",
      description: "Discover unique luxury items from around the world!",
      image: "https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3",
      color: "from-amber-600 to-red-700"
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    if (!isMounted || isPaused) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [carouselItems.length, isPaused, isMounted]);

  // Handle keyboard navigation for carousel
  useEffect(() => {
    if (!isMounted) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [carouselItems.length, isMounted]);

  // Handle View All click to scroll to new products
  const handleViewAllClick = () => {
    setShowAllAuctions(true);
    
    // Wait for the DOM to update before scrolling
    setTimeout(() => {
      if (additionalAuctionsRef.current) {
        additionalAuctionsRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }, 100);
  };

  // Format auction data for display
  const formatAuctionsForDisplay = (auctions: Auction[]) => {
    return auctions.map(auction => ({
      id: auction.id,
      name: auction.name,
      mrp: auction.minBidPrice,
      image: auction.photoUrl || 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      currentBid: auction.highestBid || auction.minBidPrice,
      timeLeft: auction.timeLeftFormatted || '2h 15m',
      endTime: auction.endTime,
      bids: auction.bids?.length || 0,
      featured: false
    }));
  };

  // Use API data if available, otherwise use fallback data
  const displayedLiveAuctions = liveAuctions.length > 0 
    ? formatAuctionsForDisplay(liveAuctions) 
    : [
        {
          id: 'BB35798',
          name: 'Apple iPhone 15 Pro Max (256GB)',
          mrp: 149900.00,
          image: 'https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
          currentBid: 45600,
          timeLeft: '2h 15m',
          endTime: '2024-05-01T12:00:00',
          bids: 24,
          featured: true
        },
        // ... other fallback auctions
      ];

  const displayedUpcomingAuctions = upcomingAuctions.length > 0
    ? upcomingAuctions.map(auction => ({
        id: auction.id,
        name: auction.name,
        mrp: auction.minBidPrice,
        image: auction.photoUrl || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3',
        opensIn: '2 days'
      }))
    : [
        {
          id: 'BB35801',
          name: 'MacBook Pro M3 Pro (16-inch)',
          mrp: 249900.00,
          image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2126&auto=format&fit=crop&ixlib=rb-4.0.3',
          opensIn: '2 days'
        },
        // ... other fallback upcoming auctions
      ];

  const displayedClosedAuctions = closedAuctions.length > 0
    ? closedAuctions.map(auction => {
        const highestBid = auction.bids && auction.bids.length > 0 
          ? Math.max(...auction.bids.map(b => b.price)) 
          : auction.minBidPrice;
        const winner = auction.bids && auction.bids.length > 0 
          ? auction.bids[0].bidder.username 
          : 'No bidders';
        
        return {
          id: auction.id,
          name: auction.name,
          mrp: auction.minBidPrice,
          image: auction.photoUrl || 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3',
          winner,
          endedAt: highestBid
        };
      })
    : [
        {
          id: 'BB35795',
          name: 'Bose QuietComfort Earbuds',
          mrp: 24900.00,
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3',
          winner: 'tech_enthusiast',
          endedAt: 8750.00
        },
        // ... other fallback closed auctions
      ];

  // Combine auctions based on whether to show all
  const displayedAuctions = showAllAuctions 
    ? [...displayedLiveAuctions, ...displayedLiveAuctions.slice(0, 3).map(auction => ({
        ...auction,
        id: `${auction.id}-duplicate` // Add a unique suffix to avoid duplicate keys
      }))]
    : displayedLiveAuctions.slice(0, 3); // Show only 3 auctions initially

  // Don't render anything until client-side hydration is complete
  if (!isMounted) {
    return null;
  }

  const handleSubscribe = async () => {
    if (!email || !email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubscribing(true);
    try {
      const result = await apiService.subscribeToNewsletter(email);
      if (result.success) {
        toast.success(result.message || 'Successfully subscribed to newsletter!');
        setEmail('');
      } else {
        toast.error(result.message || 'Failed to subscribe to newsletter');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('Failed to subscribe to newsletter');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Hero Section with Carousel */}
      <div className="relative overflow-hidden bg-white py-2" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm32-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%23f0f0f0" fill-opacity="0.4" fill-rule="evenodd"/%3E%3C/svg%3E")' }}>
        {/* Carousel */}
        <div className="relative h-[400px] md:h-[500px] max-w-[1500px] mx-auto px-0.5">
          {carouselItems.map((item, index) => (
            <motion.div
              key={`carousel-${item.title}`}
              className="absolute inset-x-0.5 top-0 bottom-0 rounded-lg overflow-hidden"
              style={{ 
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
              }}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: currentSlide === index ? 1 : 0,
                zIndex: currentSlide === index ? 10 : 0 
              }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              aria-hidden={currentSlide !== index}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${index + 1} of ${carouselItems.length}: ${item.title}`}
            >
              {/* Background gradient + image overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-70 z-10`}></div>
              <img 
                src={item.image} 
                alt={`${item.title} background`}
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                loading="lazy"
              />
              
              {/* Content */}
              <div className="relative z-20 h-full flex flex-col justify-center items-center text-white px-4">
                <motion.div
                  className="text-center max-w-3xl mx-auto bg-black/20 p-5 sm:p-6 md:p-8 rounded-lg backdrop-blur-sm w-[98%] sm:w-[95%] md:w-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: currentSlide === index ? 1 : 0,
                    y: currentSlide === index ? 0 : 20
                  }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight mb-2 sm:mb-3 md:mb-4">
                    {item.title}
                  </h1>
                  <p className="text-base sm:text-lg md:text-xl text-white/90 mb-4 sm:mb-5 md:mb-8 max-w-2xl mx-auto">
                    {item.description}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-5 sm:px-6 md:px-8 shadow-lg">
                        <Link href="/register">Free Sign Up</Link>
                      </Button>
                    </motion.div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button asChild size="lg" className="bg-transparent border-2 border-white text-white hover:bg-white/10 font-semibold px-5 sm:px-6 md:px-8 shadow-lg">
                        <Link href="/login">Sign In</Link>
                      </Button>
                    </motion.div>
                  </div>
                  
                  <p className="text-white/80 mt-4 text-sm">
                    Get 5 free credits on joining today!
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
          
          {/* Carousel indicators */}
          <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-3">
            {carouselItems.map((item, index) => (
              <button
                key={`indicator-${item.title}`}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  currentSlide === index ? 'bg-white scale-125' : 'bg-white/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={currentSlide === index ? "true" : "false"}
              />
            ))}
          </div>
          
          {/* Carousel arrows */}
          <button 
            className="absolute left-1 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all hover:scale-110"
            onClick={() => setCurrentSlide((prev) => (prev - 1 + carouselItems.length) % carouselItems.length)}
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <button 
            className="absolute right-1 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all hover:scale-110"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % carouselItems.length)}
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* Divider with statistics */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-6 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl font-bold">{statistics.averageDiscount}%</p>
              <p className="text-sm opacity-80">Average Discount</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{statistics.totalCustomers.toLocaleString()}+</p>
              <p className="text-sm opacity-80">Happy Customers</p>
            </div>
            <div>
              <p className="text-3xl font-bold">₹{(statistics.totalSavings / 1000000).toFixed(1)}M+</p>
              <p className="text-sm opacity-80">Total Savings</p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Auctions Section */}
      <div className="py-16 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Live Auctions</h2>
              <p className="text-gray-600 mt-1">Bid now on these exciting items before they're gone!</p>
            </div>
            <Button 
              variant="outline" 
              onClick={showAllAuctions ? () => setShowAllAuctions(false) : handleViewAllClick}
              className="flex items-center gap-2 hover:bg-blue-50 hover:scale-105"
            >
              {showAllAuctions ? 'Show Less' : 'View All'}
            </Button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p>Loading auctions...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedAuctions.map((auction, index) => (
                <motion.div
                  key={auction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    duration: 0.3, 
                    delay: index >= 3 ? 0.1 : index * 0.05
                  }}
                  className={index >= 3 ? "scroll-mt-32" : ""}
                  ref={index === 3 ? additionalAuctionsRef : null}
                >
                  <motion.div 
                    className="h-full"
                    whileHover={cardHover}
                  >
                    <Card className="overflow-hidden shadow-md h-full hover:shadow-xl">
                      <div className="aspect-video w-full overflow-hidden bg-gray-100">
                        <img 
                          src={auction.image} 
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
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            Auction ID: {auction.id}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mb-4">
                          <span>MRP: ₹{auction.mrp.toLocaleString()}</span>
                          <span>Bids: {auction.bids}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">Current Bid</p>
                            <p className="text-xl font-bold text-blue-600">₹{auction.currentBid.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Time Left</p>
                            <CountdownTimer endTime={auction.endTime} auctionId={auction.id} />
                          </div>
                        </div>
                        <Button 
                          className="w-full mt-4 hover:scale-[1.02]" 
                          onClick={() => router.push('/login')}
                        >
                          Place Bid
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          )}
          
          {showAllAuctions && (
            <motion.div 
              className="mt-8 flex justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Button 
                variant="outline" 
                onClick={() => setShowAllAuctions(false)}
                className="px-6 hover:scale-105"
              >
                Show Less
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-white py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Stay Updated on New Auctions</h2>
            <p className="text-gray-600 mb-6">Be the first to know when exciting new items are available for bidding</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-72"
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={handleSubscribe} disabled={isSubscribing}>
                {isSubscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-3">We respect your privacy. Unsubscribe at any time.</p>
          </div>
        </div>
      </div>

      {/* Upcoming and Closed Auctions */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Upcoming Auctions */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Upcoming Auctions</h2>
              </div>
              {isLoading ? (
                <div className="text-center py-12">
                  <p>Loading upcoming auctions...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayedUpcomingAuctions.map((auction, index) => (
                    <motion.div
                      key={auction.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      viewport={{ once: true, margin: "-50px" }}
                      whileHover={cardHover}
                    >
                      <Card className="overflow-hidden hover:shadow-md">
                        <div className="flex">
                          <div className="w-1/3 bg-gray-100">
                            <img 
                              src={auction.image} 
                              alt={auction.name}
                              className="w-full h-full object-cover"
                              height={120}
                              width={200}
                            />
                          </div>
                          <CardContent className="w-2/3 p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{auction.name}</h3>
                              <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
                                Opens in {auction.opensIn}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-2">MRP: ₹{auction.mrp.toLocaleString()}</p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2 hover:scale-105"
                              onClick={() => router.push('/login')}
                            >
                              Notify Me
                            </Button>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Closed Auctions */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Closed Auctions</h2>
              </div>
              {isLoading ? (
                <div className="text-center py-12">
                  <p>Loading closed auctions...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {displayedClosedAuctions.map((auction, index) => (
                    <motion.div
                      key={auction.id}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      viewport={{ once: true, margin: "-50px" }}
                      whileHover={cardHover}
                    >
                      <Card className="overflow-hidden hover:shadow-md">
                        <div className="flex">
                          <div className="w-1/3 bg-gray-100">
                            <img 
                              src={auction.image} 
                              alt={auction.name}
                              className="w-full h-full object-cover"
                              height={120}
                              width={200}
                            />
                          </div>
                          <CardContent className="w-2/3 p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-medium">{auction.name}</h3>
                              <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">
                                Closed
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-1">MRP: ₹{auction.mrp.toLocaleString()}</p>
                            <p className="text-sm mb-2">
                              <span className="text-gray-500">Winner: </span>
                              <span className="font-medium">{auction.winner}</span>
                            </p>
                            <p className="text-sm">
                              <span className="text-gray-500">Ended at: </span>
                              <span className="text-green-600 font-medium">₹{auction.endedAt.toLocaleString()}</span>
                            </p>
                          </CardContent>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-lg text-gray-600">Simple steps to start bidding and winning</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                id: "step-1",
                step: 1,
                title: "Sign Up",
                description: "Create your free account in less than 30 seconds and get 5 free credits",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM4 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 10.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                  </svg>
                )
              },
              {
                id: "step-2",
                step: 2,
                title: "Place Bids",
                description: "Browse auctions and place strategic bids to win amazing products",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                  </svg>
                )
              },
              {
                id: "step-3",
                step: 3,
                title: "Win & Save",
                description: "Win auctions and get brand new products at up to 85% discount",
                icon: (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0" />
                  </svg>
                )
              }
            ].map((item) => (
              <motion.div 
                key={item.id}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: item.step * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                whileHover={{ y: -5 }}
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-blue-200 transition-colors">
                    <div className="text-blue-600">
                      {item.icon}
                    </div>
                  </div>
                  <div className="absolute top-0 right-0 left-0 h-0.5 bg-blue-200 -z-10 mt-8">
                    {/* Connection line between steps */}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/register">Get Started Now</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">100% Risk-Free Online Auctions</h2>
            <p className="text-gray-600 mt-2">Shop with confidence on our secure platform</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              {
                id: "brand-new",
                title: "Only Brand New Products",
                icon: (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )
              },
              {
                id: "payment",
                title: "Safe Payment Gateways",
                icon: (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                id: "no-reserve",
                title: "No Reserve Price",
                icon: (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                )
              },
              {
                id: "buy-now",
                title: "Buy-Now Discounts",
                icon: (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((badge) => (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  {badge.icon}
                </div>
                <p className="text-gray-800 font-medium">{badge.title}</p>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 flex justify-center">
            <div className="flex items-center space-x-4">
              <img src="https://cdn.pixabay.com/photo/2018/05/08/21/29/paypal-3384015_1280.png" alt="PayPal" className="h-8 opacity-70" />
              <img src="https://cdn.pixabay.com/photo/2021/12/06/13/48/visa-6850402_1280.png" alt="Visa" className="h-8 opacity-70" />
              <img src="https://cdn.pixabay.com/photo/2021/12/06/13/45/mastercard-6850363_1280.png" alt="Mastercard" className="h-8 opacity-70" />
              <img src="https://cdn.pixabay.com/photo/2022/01/17/14/39/payment-6945310_1280.png" alt="American Express" className="h-8 opacity-70" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Start Bidding?</h2>
            <p className="text-xl text-blue-100 mb-8">Join thousands of users and start winning auctions today!</p>
            <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Link href="/register">Create Free Account</Link>
            </Button>
            <p className="text-blue-200 mt-4 text-sm">No credit card required • 5 free credits on signup</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-bold mb-4">Online Auction</h3>
              <p className="text-sm">The premier platform for online auctions with amazing discounts on brand new products.</p>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white" aria-label="Facebook">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white" aria-label="Twitter">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-400 hover:text-white" aria-label="Instagram">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/auctions" className="hover:text-white">Browse Auctions</Link></li>
                <li><Link href="/how-it-works" className="hover:text-white">How It Works</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQs</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/refunds" className="hover:text-white">Refund Policy</Link></li>
                <li><Link href="/shipping" className="hover:text-white">Shipping Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-medium mb-4">Contact</h4>
              <address className="text-sm not-italic">
                <p>123 Auction Street</p>
                <p>Mumbai, Maharashtra 400001</p>
                <p className="mt-2">Email: support@onlineauction.com</p>
                <p>Phone: +91 98765 43210</p>
              </address>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>© 2023 Online Auction. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

// Export the component as a client-side only component
export default HomePage;
