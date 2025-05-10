'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export default function ProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '(555) 123-4567',
    bio: 'Passionate collector of vintage items and antiques with over 10 years of experience in online auctions.',
    location: 'New York, NY',
    avatar: '',
  });

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call to update profile
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Mock data for purchase history
  const purchaseHistory = [
    {
      id: 1,
      item: 'Vintage Record Player',
      seller: 'VintageTech',
      date: '2023-05-10',
      amount: '$180.00',
      status: 'Completed'
    },
    {
      id: 2,
      item: 'Art Deco Lamp',
      seller: 'ArtCollector',
      date: '2023-04-28',
      amount: '$220.00',
      status: 'Completed'
    },
    {
      id: 3,
      item: 'Antique Pocket Watch',
      seller: 'TimelessTreasures',
      date: '2023-04-15',
      amount: '$320.00',
      status: 'Completed'
    }
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4"
            >
              ← Back
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Your Profile</h1>
            <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Sidebar */}
            <Card className="md:col-span-1 bg-white">
              <CardContent className="p-6 flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{profileData.firstName} {profileData.lastName}</h2>
                <p className="text-gray-500 text-sm mt-1">{profileData.email}</p>
                
                <div className="flex gap-2 mt-4">
                  <Badge variant="secondary">Verified Buyer</Badge>
                  <Badge variant="secondary">Seller</Badge>
                </div>
                
                <div className="w-full mt-6 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('profile')}
                  >
                    Profile Information
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('password')}
                  >
                    Change Password
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setActiveTab('history')}
                  >
                    Purchase History
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => router.push('/settings')}
                  >
                    Account Settings
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Profile Content */}
            <div className="md:col-span-2">
              {activeTab === 'profile' && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={profileData.firstName}
                            onChange={handleInputChange}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={profileData.lastName}
                            onChange={handleInputChange}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={profileData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleInputChange}
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={profileData.location}
                          onChange={handleInputChange}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={profileData.bio}
                          onChange={handleInputChange}
                          rows={4}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="avatar">Profile Picture URL</Label>
                        <Input
                          id="avatar"
                          name="avatar"
                          type="url"
                          placeholder="https://example.com/avatar.jpg"
                          value={profileData.avatar}
                          onChange={handleInputChange}
                          disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500">Optional: Link to your profile picture</p>
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full md:w-auto"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'password' && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          name="currentPassword"
                          type="password"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          name="newPassword"
                          type="password"
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type="password"
                          disabled={isLoading}
                        />
                      </div>

                      <Button 
                        type="submit" 
                        className="w-full md:w-auto"
                        disabled={isLoading}
                      >
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'history' && (
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Purchase History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Item</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Seller</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Date</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Amount</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {purchaseHistory.map((purchase) => (
                            <tr key={purchase.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">{purchase.item}</td>
                              <td className="py-3 px-4">{purchase.seller}</td>
                              <td className="py-3 px-4">{purchase.date}</td>
                              <td className="py-3 px-4 font-medium">{purchase.amount}</td>
                              <td className="py-3 px-4">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {purchase.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
} 