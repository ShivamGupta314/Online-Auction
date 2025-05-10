'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import ProtectedRoute from '@/components/layout/ProtectedRoute';

export default function CreateAuctionPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    startingBid: '',
    duration: '7', // Default 7 days
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call to create auction
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Auction created successfully!');
      router.push('/dashboard/seller');
    } catch (error) {
      toast.error('Failed to create auction. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const categories = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'clothing', label: 'Clothing' },
    { value: 'collectibles', label: 'Collectibles' },
    { value: 'art', label: 'Art' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'books', label: 'Books' },
    { value: 'sports', label: 'Sports Equipment' },
    { value: 'toys', label: 'Toys & Games' },
    { value: 'other', label: 'Other' },
  ];

  const durations = [
    { value: '1', label: '1 Day' },
    { value: '3', label: '3 Days' },
    { value: '5', label: '5 Days' },
    { value: '7', label: '7 Days' },
    { value: '10', label: '10 Days' },
    { value: '14', label: '14 Days' },
    { value: '30', label: '30 Days' },
  ];

  return (
    <ProtectedRoute requiredRole="SELLER">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.push('/dashboard/seller')}
              className="mb-4"
            >
              ← Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Auction</h1>
            <p className="text-gray-600 mt-2">Fill in the details below to create a new auction listing</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Auction Details</CardTitle>
              <CardDescription>
                Provide accurate information to attract more bidders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter the name of your item"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Provide a detailed description of your item"
                    value={formData.description}
                    onChange={handleChange}
                    rows={5}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startingBid">Starting Bid ($)</Label>
                    <Input
                      id="startingBid"
                      name="startingBid"
                      type="number"
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.startingBid}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="duration">Auction Duration</Label>
                    <Select
                      value={formData.duration}
                      onValueChange={(value) => handleSelectChange('duration', value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent>
                        {durations.map((duration) => (
                          <SelectItem key={duration.value} value={duration.value}>
                            {duration.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input
                      id="imageUrl"
                      name="imageUrl"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <p className="text-xs text-gray-500">Optional: Link to an image of your item</p>
                  </div>
                </div>

                <div className="pt-4">
                  <Button 
                    type="submit" 
                    className="w-full md:w-auto"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Auction...' : 'Create Auction'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
} 