'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useState } from 'react';
import { authService } from '@/services/auth';
import { toast } from 'sonner';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'BIDDER' as 'BIDDER' | 'SELLER',
    acceptTerms: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast.error('You must accept the Terms and Conditions to register');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (formData.username.length < 3 || formData.username.length > 20) {
      toast.error('Username must be between 3 and 20 characters');
      return;
    }

    setIsLoading(true);

    try {
      // First register the user
      await authService.register({
        username: formData.username,
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      
      toast.success('Registration successful! 5 free credits have been added to your account.');
      
      // Then login automatically
      const loginResponse = await authService.login({
        email: formData.email,
        password: formData.password,
      });
      
      // Navigate to the appropriate dashboard
      const dashboardPath = formData.role === 'SELLER' ? '/dashboard/seller' : '/dashboard';
      window.location.href = dashboardPath;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (value: 'BIDDER' | 'SELLER') => {
    setFormData(prev => ({
      ...prev,
      role: value
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      acceptTerms: checked
    }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Sign up and get 5 free credits</p>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    placeholder="Choose a unique username (3-20 characters)"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password (min 8 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <RadioGroup 
                    value={formData.role} 
                    onValueChange={(value) => handleRoleChange(value as 'BIDDER' | 'SELLER')}
                    className="flex flex-col space-y-2 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="BIDDER" id="bidder" />
                      <Label htmlFor="bidder" className="cursor-pointer">
                        <div>
                          <span className="font-medium">Bidder</span>
                          <p className="text-sm text-gray-500">Browse and bid on auctions</p>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="SELLER" id="seller" />
                      <Label htmlFor="seller" className="cursor-pointer">
                        <div>
                          <span className="font-medium">Seller</span>
                          <p className="text-sm text-gray-500">Create and manage auctions</p>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox 
                    id="terms" 
                    checked={formData.acceptTerms}
                    onCheckedChange={handleCheckboxChange}
                  />
                  <Label htmlFor="terms" className="text-sm leading-tight cursor-pointer">
                    I accept the <Link href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link> and the <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                  </Label>
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Create Free Account'}
                </Button>
              </form>
              <div className="mt-6 text-center">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300"></span>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button variant="outline" className="w-full" onClick={() => router.push('/login')}>
                    Sign In
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Right side - Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-blue-600 to-indigo-700 p-12 items-center justify-center">
        <div className="max-w-lg text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Win Big</h2>
          <p className="text-xl mb-8">Why pay retail prices? Get up to 85% discounts on brand new products!</p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4">Free Sign Up</h3>
            <p className="mb-4">Sign-up takes less than 30 seconds. Get 5 Free Credits on Joining.</p>
            <div className="flex justify-center space-x-4">
              <div className="text-center">
                <div className="text-3xl font-bold">60,000+</div>
                <div className="text-sm">Members</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">15,000+</div>
                <div className="text-sm">Completed Auctions</div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Only Brand New Products</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>No Auction Reserve Price</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Free of Charge Returns</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Buy-Now Discounts Assured</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 