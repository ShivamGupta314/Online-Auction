'use client';

import { useState, useEffect, useRef } from 'react';
import socketService from '@/services/socketService';

interface CountdownTimerProps {
  endTime: string;
  auctionId: string;
  className?: string;
  onEnd?: () => void;
}

/**
 * Reusable countdown timer component that uses local time calculation for now
 * until we fix the socket connection issues
 */
export function CountdownTimer({ endTime, auctionId, className = '', onEnd }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const usingSocketRef = useRef<boolean>(false);
  
  useEffect(() => {
    // Calculate time left using local time
    const calculateTimeLeft = () => {
      const now = new Date();
      const end = new Date(endTime);
      const difference = end.getTime() - now.getTime();
      
      if (difference <= 0) {
        setTimeLeft('Ended');
        if (onEnd) onEnd();
        return;
      }
      
      // Calculate days, hours, minutes, seconds
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);
      
      // Format the time left string
      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };
    
    // Initial calculation
    calculateTimeLeft();
    
    // Update every second
    timerRef.current = setInterval(calculateTimeLeft, 1000);
    
    // Clean up on component unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [endTime, onEnd]);
  
  return (
    <div className={`flex items-center text-orange-500 font-medium ${className}`}>
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      </svg>
      {timeLeft}
    </div>
  );
} 