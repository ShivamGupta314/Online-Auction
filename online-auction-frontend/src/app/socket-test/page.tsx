'use client';

import { useState, useEffect } from 'react';
import socketService from '@/services/socketService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function SocketTestPage() {
  const [connectionStatus, setConnectionStatus] = useState('Not connected');
  const [log, setLog] = useState<string[]>([]);

  const addToLog = (message: string) => {
    setLog((prev) => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]} - ${message}`]);
  };

  useEffect(() => {
    // Try to connect to socket
    try {
      socketService.connect();
      
      // Check connection status after a short delay
      setTimeout(() => {
        const isConnected = socketService.isConnected();
        setConnectionStatus(isConnected ? 'Connected' : 'Failed to connect');
        addToLog(isConnected ? 'Socket connected successfully' : 'Socket connection failed');
      }, 1000);
    } catch (error) {
      console.error('Error connecting to socket:', error);
      setConnectionStatus('Error connecting');
      addToLog(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return () => {
      socketService.disconnect();
      addToLog('Socket disconnected');
    };
  }, []);

  const handleConnect = () => {
    try {
      socketService.connect();
      addToLog('Attempting to connect...');
      
      // Check connection status after a short delay
      setTimeout(() => {
        const isConnected = socketService.isConnected();
        setConnectionStatus(isConnected ? 'Connected' : 'Failed to connect');
        addToLog(isConnected ? 'Socket connected successfully' : 'Socket connection failed');
      }, 1000);
    } catch (error) {
      console.error('Error connecting to socket:', error);
      setConnectionStatus('Error connecting');
      addToLog(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleDisconnect = () => {
    socketService.disconnect();
    setConnectionStatus('Disconnected');
    addToLog('Socket disconnected');
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-6">Socket.IO Connection Test</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Connection Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div 
              className={`w-4 h-4 rounded-full ${
                connectionStatus === 'Connected' 
                  ? 'bg-green-500' 
                  : connectionStatus === 'Disconnected' 
                    ? 'bg-gray-500' 
                    : 'bg-red-500'
              }`}
            ></div>
            <span>{connectionStatus}</span>
          </div>
          
          <div className="flex gap-4 mt-4">
            <Button onClick={handleConnect}>Connect</Button>
            <Button onClick={handleDisconnect} variant="outline">Disconnect</Button>
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