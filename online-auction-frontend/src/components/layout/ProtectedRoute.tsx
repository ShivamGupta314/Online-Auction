'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = () => {
      console.log("Protected route - checking auth...");
      console.log("Is authenticated:", authService.isAuthenticated());
      console.log("User role:", authService.getUserRole());
      console.log("Required role:", requiredRole);
      
      const isAuthenticated = authService.isAuthenticated();
      
      if (!isAuthenticated) {
        console.log("Not authenticated, redirecting to login...");
        toast.error('Please log in to access this page');
        router.push('/login');
        return false;
      }
      
      // Check role if required
      if (requiredRole && authService.getUserRole() !== requiredRole) {
        console.log("Wrong role, redirecting to dashboard...");
        toast.error(`You need ${requiredRole} role to access this page`);
        router.push('/dashboard');
        return false;
      }
      
      return true;
    };

    const authorized = checkAuth();
    setIsAuthorized(authorized);
    setIsLoading(false);
  }, [router, requiredRole]);

  // Show loading or children based on authorization state
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthorized ? <>{children}</> : null;
} 