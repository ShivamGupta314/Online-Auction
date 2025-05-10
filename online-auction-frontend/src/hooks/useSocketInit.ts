import { useEffect } from 'react';
import socketService from '@/services/socketService';
import { authService } from '@/services/auth';

/**
 * Hook to initialize socket connection when the app loads
 * and the user is authenticated
 */
export const useSocketInit = () => {
  useEffect(() => {
    // Only connect if the user is authenticated
    if (authService.isAuthenticated()) {
      socketService.connect();
      
      // Clean up on unmount
      return () => {
        socketService.disconnect();
      };
    }
  }, []);
}; 