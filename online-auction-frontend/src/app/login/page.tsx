'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { authService } from '@/services/auth';
import { toast } from 'sonner';
import Link from 'next/link';
import { Checkbox } from '@/components/ui/checkbox';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      toast.success('Login successful!');
      
      // Force a hard navigation to ensure the redirect works
      const role = authService.getUserRole();
      const dashboardPath = role === 'SELLER' ? '/dashboard/seller' : '/dashboard';
      
      // Use window.location for a full page navigation instead of router.push
      window.location.href = dashboardPath;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed. Please check your credentials.');
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

  const handleCheckboxChange = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      rememberMe: checked
    }));
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Banner */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-blue-600 to-indigo-700 p-12 items-center justify-center">
        <div className="max-w-lg text-center text-white">
          <h2 className="text-4xl font-bold mb-6">Welcome Back</h2>
          <p className="text-xl mb-8">Log in to your account to continue bidding and winning amazing deals!</p>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-bold mb-4">Current Live Auctions</h3>
            <p className="mb-4">Don't miss out on these amazing deals ending soon!</p>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                <span>iPhone 15 Pro Max</span>
                <span className="text-orange-300">2h 15m left</span>
              </div>
              <div className="flex justify-between items-center bg-white/5 p-3 rounded">
                <span>Sony Headphones</span>
                <span className="text-orange-300">4h 30m left</span>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Up to 85% Discounts</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Brand New Products</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Sign In</h1>
            <p className="text-gray-600 mt-2">Access your account to start bidding</p>
          </div>
          
          <Card className="border-0 shadow-lg">
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="border-gray-300"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="rememberMe" 
                      checked={formData.rememberMe}
                      onCheckedChange={handleCheckboxChange}
                    />
                    <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                      Remember Me
                    </Label>
                  </div>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
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
                  <Button variant="outline" className="w-full" onClick={() => router.push('/register')}>
                    Create Free Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>By signing in, you agree to our <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
} 