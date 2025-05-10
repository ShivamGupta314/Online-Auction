'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Calendar, 
  DollarSign, 
  Download, 
  Package, 
  Wallet
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function SellerRevenuePage() {
  const router = useRouter();

  const revenueStats = [
    { 
      title: 'Total Revenue', 
      value: '$3,250.00', 
      change: '+12%', 
      trend: 'up',
      icon: <DollarSign className="h-4 w-4 text-green-500" />
    },
    { 
      title: 'Pending Payments', 
      value: '$850.00', 
      change: '-5%', 
      trend: 'down',
      icon: <Wallet className="h-4 w-4 text-yellow-500" />
    },
    { 
      title: 'Completed Sales', 
      value: '12', 
      change: '+3', 
      trend: 'up',
      icon: <Package className="h-4 w-4 text-blue-500" />
    },
    { 
      title: 'Average Sale Price', 
      value: '$270.83', 
      change: '+$15.50', 
      trend: 'up',
      icon: <Calendar className="h-4 w-4 text-purple-500" />
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      item: 'Antique Wooden Chair',
      buyer: 'John Smith',
      date: '2023-05-08',
      amount: '$350.00',
      status: 'completed'
    },
    {
      id: 2,
      item: 'Vintage Camera Collection',
      buyer: 'Emily Johnson',
      date: '2023-05-05',
      amount: '$275.00',
      status: 'completed'
    },
    {
      id: 3,
      item: 'Mechanical Wristwatch',
      buyer: 'Michael Brown',
      date: '2023-05-01',
      amount: '$450.00',
      status: 'completed'
    },
    {
      id: 4,
      item: 'Art Deco Lamp',
      buyer: 'Sarah Wilson',
      date: '2023-04-28',
      amount: '$220.00',
      status: 'pending'
    },
    {
      id: 5,
      item: 'Vintage Vinyl Records',
      buyer: 'David Lee',
      date: '2023-04-25',
      amount: '$180.00',
      status: 'pending'
    }
  ];

  const monthlyRevenue = [
    { month: 'Jan', amount: 1200 },
    { month: 'Feb', amount: 1800 },
    { month: 'Mar', amount: 2200 },
    { month: 'Apr', amount: 1900 },
    { month: 'May', amount: 3250 },
  ];

  // Calculate the max amount for the chart scaling
  const maxAmount = Math.max(...monthlyRevenue.map(item => item.amount));

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
            <h1 className="text-3xl font-bold text-gray-900">Revenue Dashboard</h1>
            <p className="text-gray-600 mt-2">Track your earnings and financial performance</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {revenueStats.map((stat, index) => (
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
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span className={stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}>
                      {stat.change}
                    </span>
                    <span className="text-gray-500 ml-2">from last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Revenue Chart */}
          <Card className="bg-white mb-8">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Revenue Overview</CardTitle>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <div className="flex h-64 items-end gap-2 mt-4">
                  {monthlyRevenue.map((item, index) => (
                    <div key={index} className="relative flex flex-1 flex-col items-center">
                      <div 
                        className="bg-blue-600 w-full rounded-t-md" 
                        style={{ height: `${(item.amount / maxAmount) * 100}%` }}
                      ></div>
                      <span className="text-xs font-medium mt-2">{item.month}</span>
                      <span className="absolute bottom-[calc(100%+8px)] text-xs font-semibold">
                        ${item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transactions */}
          <Card className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium">Recent Transactions</CardTitle>
              <Tabs defaultValue="all" className="w-[400px]">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Item</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Buyer</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{transaction.item}</td>
                        <td className="py-3 px-4">{transaction.buyer}</td>
                        <td className="py-3 px-4">{transaction.date}</td>
                        <td className="py-3 px-4 font-medium">{transaction.amount}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
                          >
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 