'use client';

import { useRouter, usePathname } from 'next/navigation';
import { 
  Home,
  Package,
  Bell,
  Settings,
  LogOut,
  User,
  Gavel,
  History,
  Heart,
  DollarSign,
  PlusCircle,
  List,
  BarChart,
  Users,
  Tag,
  ShoppingCart,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarContentProps {
  user: any;
  onLogout: () => void;
}

export function SidebarContent({ user, onLogout }: SidebarContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAdmin = user?.role === 'ADMIN';
  const isSeller = user?.role === 'SELLER';
  const isBidder = user?.role === 'BIDDER';

  const navigation = [
    // Common navigation items
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      roles: ['ADMIN', 'SELLER', 'BIDDER']
    },
    {
      name: 'Profile',
      href: '/profile',
      icon: User,
      roles: ['ADMIN', 'SELLER', 'BIDDER']
    },
    {
      name: 'Notifications',
      href: '/dashboard/notifications',
      icon: Bell,
      roles: ['ADMIN', 'SELLER', 'BIDDER']
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: ['ADMIN', 'SELLER', 'BIDDER']
    },

    // Admin specific items
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      roles: ['ADMIN']
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: Tag,
      roles: ['ADMIN']
    },
    {
      name: 'Reports',
      href: '/admin/reports',
      icon: BarChart,
      roles: ['ADMIN']
    },

    // Seller specific items
    {
      name: 'My Auctions',
      href: '/dashboard/my-auctions',
      icon: List,
      roles: ['SELLER']
    },
    {
      name: 'Create Auction',
      href: '/dashboard/create-auction',
      icon: PlusCircle,
      roles: ['SELLER']
    },
    {
      name: 'Sales History',
      href: '/dashboard/sales-history',
      icon: History,
      roles: ['SELLER']
    },

    // Bidder specific items
    {
      name: 'Active Bids',
      href: '/dashboard/active-bids',
      icon: Gavel,
      roles: ['BIDDER']
    },
    {
      name: 'Won Auctions',
      href: '/dashboard/won',
      icon: Package,
      roles: ['BIDDER']
    },
    {
      name: 'Watchlist',
      href: '/dashboard/watchlist',
      icon: Heart,
      roles: ['BIDDER']
    },
    {
      name: 'Bid History',
      href: '/dashboard/bid-history',
      icon: History,
      roles: ['BIDDER']
    },
    {
      name: 'My Orders',
      href: '/dashboard/orders',
      icon: ShoppingCart,
      roles: ['BIDDER']
    },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="flex flex-col h-full">
      {/* User Profile Section */}
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-xl font-bold text-white">
              {user?.username?.substring(0, 2).toUpperCase() || 'UB'}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-blue-100">
              {isAdmin ? 'Admin' : isSeller ? 'Seller' : 'Bidder'} Account
            </p>
          </div>
        </div>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation Items */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Button
                key={item.name}
                variant="ghost"
                className={cn(
                  "w-full justify-start text-white hover:bg-white/10",
                  isActive && "bg-white/10"
                )}
                onClick={() => router.push(item.href)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/10" />

      {/* Logout Button */}
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-white/10"
          onClick={onLogout}
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
} 