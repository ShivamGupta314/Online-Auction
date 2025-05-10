'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { io } from 'socket.io-client';

// Use the environment variable for the socket URL
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5001';

export default function BasicSocketTest() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState('Not connected');

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString().substring(11, 19)} - ${message}`]);
  };

  const handleConnect = () => {
    addLog('Attempting to connect to socket...');
    addLog(`Socket URL: ${SOCKET_URL}`);
    setStatus('Connecting...');
    
    try {
      // Create socket connection with minimal configuration
      const socket = io(SOCKET_URL, {
        transports: ['polling'],
        reconnection: true,
        path: '/socket.io/'
      });
      
      socket.on('connect', () => {
        addLog(`Connected successfully! Socket ID: ${socket.id}`);
        setStatus('Connected');
      });
      
      socket.on('connect_error', (err) => {
        addLog(`Connection error: ${err.message}`);
        setStatus('Error');
        console.error('Connect error details:', err);
      });
      
      socket.io.on('error', (err) => {
        addLog(`Transport error: ${err.message}`);
        console.error('Transport error details:', err);
      });
      
      socket.io.on('reconnect_attempt', (attempt) => {
        addLog(`Reconnection attempt #${attempt}`);
      });
      
      socket.on('disconnect', (reason) => {
        addLog(`Disconnected: ${reason}`);
        setStatus('Disconnected');
      });
      
      // Return cleanup function
      return () => {
        addLog('Cleaning up socket connection');
        socket.disconnect();
      };
    } catch (error) {
      console.error('Error creating socket:', error);
      addLog(`Error creating socket: ${error instanceof Error ? error.message : String(error)}`);
      setStatus('Error');
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Basic Socket.IO Test</h1>
      <p className="mb-6 text-gray-700">This is a minimal test that tries to connect to your Socket.IO server without any authentication.</p>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Socket Connection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div 
              className={`w-4 h-4 rounded-full ${
                status === 'Connected' 
                  ? 'bg-green-500' 
                  : status === 'Connecting...'
                    ? 'bg-yellow-500'
                    : status === 'Disconnected' 
                      ? 'bg-gray-500' 
                      : 'bg-red-500'
              }`}
            ></div>
            <span>{status}</span>
          </div>
          
          <Button onClick={handleConnect}>Connect to Socket</Button>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Connection Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-100 p-4 rounded-md h-64 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click "Connect to Socket" to begin.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 