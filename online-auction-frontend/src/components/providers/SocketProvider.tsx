'use client';

import { useEffect, useState } from 'react';
import socketService from '@/services/socketService';
import { authService } from '@/services/auth';

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connectionTried, setConnectionTried] = useState(false);

  useEffect(() => {
    // Only connect if the user is authenticated
    if (authService.isAuthenticated() && !connectionTried) {
      try {
        // Initialize socket connection
        socketService.connect();
        setConnectionTried(true);
      } catch (error) {
        console.error('Error in socket initialization:', error);
      }
      
      // Clean up on unmount
      return () => {
        try {
          socketService.disconnect();
        } catch (error) {
          console.error('Error disconnecting socket:', error);
        }
      };
    }
  }, [connectionTried]);

  return <>{children}</>;
} 