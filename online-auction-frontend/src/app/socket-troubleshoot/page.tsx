'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { io } from 'socket.io-client';

export default function SocketTroubleshootPage() {
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  const [log, setLog] = useState<string[]>([]);
  const [token, setToken] = useState<string | null>(null);

  const addToLog = (message: string) => {
    setLog((prev) => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  useEffect(() => {
    // Get token
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    
    if (!storedToken) {
      addToLog('No token found. Please log in first.');
      return;
    }

    addToLog(`Token found: ${storedToken.substring(0, 15)}...`);
  }, []);

  const handleDirectConnect = () => {
    if (!token) {
      addToLog('No token available. Please log in first.');
      return;
    }

    addToLog('Attempting direct socket.io connection...');
    setConnectionStatus('Connecting...');

    try {
      // Create a direct socket.io connection
      const socket = io('http://localhost:5001', {
        auth: { token },
        transports: ['polling'],
        timeout: 20000,
        path: '/socket.io/',
        withCredentials: false,
        extraHeaders: {
          Authorization: `Bearer ${token}`
        }
      });

      // Socket event listeners
      socket.on('connect', () => {
        addToLog(`Connected successfully! Socket ID: ${socket.id}`);
        setConnectionStatus('Connected');
      });

      socket.on('connect_error', (err) => {
        addToLog(`Connection error: ${err.message}`);
        setConnectionStatus('Error');
        console.error('Socket connect error:', err);
      });

      socket.on('disconnect', (reason) => {
        addToLog(`Disconnected: ${reason}`);
        setConnectionStatus('Disconnected');
      });

      socket.on('error', (err) => {
        addToLog(`Socket error: ${err}`);
        console.error('Socket error:', err);
      });

      // Cleanup function
      return () => {
        socket.disconnect();
        addToLog('Socket connection closed');
      };
    } catch (error) {
      console.error('Error initializing socket:', error);
      addToLog(`Error initializing socket: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setConnectionStatus('Error');
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Socket.IO Direct Connection Test</h1>
      
      <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="font-medium text-yellow-800">Troubleshooting Instructions:</p>
        <ol className="list-decimal ml-5 mt-2 space-y-1 text-yellow-700">
          <li>Make sure you are logged in first</li>
          <li>Click the "Direct Connect" button below</li>
          <li>Check the log for connection messages</li>
          <li>If successful, this proves your backend Socket.IO server is working</li>
        </ol>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div 
              className={`w-4 h-4 rounded-full ${
                connectionStatus === 'Connected' 
                  ? 'bg-green-500' 
                  : connectionStatus === 'Connecting...'
                    ? 'bg-yellow-500'
                    : connectionStatus === 'Disconnected' 
                      ? 'bg-gray-500' 
                      : 'bg-red-500'
              }`}
            ></div>
            <span>{connectionStatus}</span>
          </div>
          
          <p className="mb-4">
            Token Status: {token ? 'Available ✅' : 'Not Found ❌'}
          </p>
          
          <div className="flex gap-4">
            <Button onClick={handleDirectConnect}>Direct Connect</Button>
            <Button onClick={() => window.location.href = '/login'} variant="outline">Go to Login</Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Connection Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {log.length === 0 ? (
              <p className="text-gray-500">No log entries yet</p>
            ) : (
              log.map((entry, index) => (
                <div key={index} className="mb-1">
                  {entry}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 