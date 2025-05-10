'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'BIDDER' | 'SELLER' | 'ADMIN';
}

export default function ProtectedRoute({ 
  children, 
  requiredRole 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const isAuthenticated = authService.isAuthenticated();
    
    if (!isAuthenticated) {
      toast.error('Please login to access this page');
      router.push('/login');
      return;
    }

    // If role is required, check if user has the required role
    if (requiredRole) {
      const userRole = authService.getUserRole();
      
      if (userRole !== requiredRole) {
        toast.error(`You need ${requiredRole} permissions to access this page`);
        router.push('/login');
        return;
      }
    }

    setIsAuthorized(true);
    setIsLoading(false);
  }, [router, requiredRole]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Render children only if user is authorized
  return isAuthorized ? <>{children}</> : null;
} 