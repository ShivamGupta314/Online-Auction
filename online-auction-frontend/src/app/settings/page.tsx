'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Bell, Lock, Shield, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    bidUpdates: true,
    auctionEndAlerts: true,
    newItemsFromFavoriteSellers: false,
    marketingEmails: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showBiddingHistory: true,
    showPurchaseHistory: false,
  });

  const handleSwitchChange = (setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handlePrivacyChange = (setting: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev]
    }));
  };

  const handleProfileVisibilityChange = (value: string) => {
    setPrivacySettings(prev => ({
      ...prev,
      profileVisibility: value
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);

    try {
      // Simulate API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion is disabled in this demo.');
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
            <p className="text-gray-600 mt-2">Manage your account preferences and settings</p>
          </div>

          <Tabs defaultValue="notifications" className="space-y-6">
            <TabsList>
              <TabsTrigger value="notifications">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="privacy">
                <Shield className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how and when you want to be notified about auction activity
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications" className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleSwitchChange('emailNotifications')}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="bidUpdates" className="font-medium">Bid Updates</Label>
                      <p className="text-sm text-gray-500">Get notified when you're outbid</p>
                    </div>
                    <Switch 
                      id="bidUpdates" 
                      checked={notificationSettings.bidUpdates}
                      onCheckedChange={() => handleSwitchChange('bidUpdates')}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="auctionEndAlerts" className="font-medium">Auction End Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified when auctions you're participating in are ending soon</p>
                    </div>
                    <Switch 
                      id="auctionEndAlerts" 
                      checked={notificationSettings.auctionEndAlerts}
                      onCheckedChange={() => handleSwitchChange('auctionEndAlerts')}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="newItemsFromFavoriteSellers" className="font-medium">New Items from Favorite Sellers</Label>
                      <p className="text-sm text-gray-500">Get notified when your favorite sellers list new items</p>
                    </div>
                    <Switch 
                      id="newItemsFromFavoriteSellers" 
                      checked={notificationSettings.newItemsFromFavoriteSellers}
                      onCheckedChange={() => handleSwitchChange('newItemsFromFavoriteSellers')}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails" className="font-medium">Marketing Emails</Label>
                      <p className="text-sm text-gray-500">Receive promotional emails and special offers</p>
                    </div>
                    <Switch 
                      id="marketingEmails" 
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={() => handleSwitchChange('marketingEmails')}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Notification Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy">
              <Card>
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control your privacy and what information is visible to others
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label className="font-medium">Profile Visibility</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer ${
                          privacySettings.profileVisibility === 'public' ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleProfileVisibilityChange('public')}
                      >
                        <div className="font-medium mb-1">Public</div>
                        <p className="text-sm text-gray-500">Your profile is visible to everyone</p>
                      </div>
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer ${
                          privacySettings.profileVisibility === 'limited' ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleProfileVisibilityChange('limited')}
                      >
                        <div className="font-medium mb-1">Limited</div>
                        <p className="text-sm text-gray-500">Only show basic information</p>
                      </div>
                      <div 
                        className={`border rounded-lg p-4 cursor-pointer ${
                          privacySettings.profileVisibility === 'private' ? 'border-blue-500 bg-blue-50' : ''
                        }`}
                        onClick={() => handleProfileVisibilityChange('private')}
                      >
                        <div className="font-medium mb-1">Private</div>
                        <p className="text-sm text-gray-500">Only visible to users you interact with</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showBiddingHistory" className="font-medium">Show Bidding History</Label>
                      <p className="text-sm text-gray-500">Allow others to see items you've bid on</p>
                    </div>
                    <Switch 
                      id="showBiddingHistory" 
                      checked={privacySettings.showBiddingHistory}
                      onCheckedChange={() => handlePrivacyChange('showBiddingHistory')}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showPurchaseHistory" className="font-medium">Show Purchase History</Label>
                      <p className="text-sm text-gray-500">Allow others to see items you've purchased</p>
                    </div>
                    <Switch 
                      id="showPurchaseHistory" 
                      checked={privacySettings.showPurchaseHistory}
                      onCheckedChange={() => handlePrivacyChange('showPurchaseHistory')}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSaveSettings}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save Privacy Settings'}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and login preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/profile')}
                      className="w-full md:w-auto"
                    >
                      Change Password
                    </Button>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Add an extra layer of security to your account by requiring a verification code when you sign in.
                      </p>
                      <Button variant="outline">Set Up Two-Factor Authentication</Button>
                    </div>
                    
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-medium flex items-center text-red-600 mb-4">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        Danger Zone
                      </h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Once you delete your account, there is no going back. Please be certain.
                      </p>
                      <Button 
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        className="flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProtectedRoute>
  );
} 