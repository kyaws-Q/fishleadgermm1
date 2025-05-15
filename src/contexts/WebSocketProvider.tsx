import React, { useContext, useEffect, useState, ReactNode } from 'react';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { WebSocketContext, WebSocketContextType, WebSocketMessage } from './WebSocketContext';

export function WebSocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const { user, isRealTimeEnabled, setDateRange } = useApp();

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isRealTimeEnabled || !user) return;

    // In a real app, this would be your WebSocket server URL
    // For demo purposes, we'll use a mock URL
    const wsUrl = `wss://api.example.com/ws?userId=${user.id}`;
    
    try {
      const newSocket = new WebSocket(wsUrl);
      
      newSocket.onopen = () => {
        console.log('WebSocket connection established');
        setIsConnected(true);
        toast.success('Real-time updates connected');
      };
      
      newSocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          
          // Handle different message types
          if (data.type === 'purchase_update') {
            // This would trigger a refresh of the purchases data
            toast.info('New purchase data available');
          } else if (data.type === 'notification') {
            toast.info(data.message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      newSocket.onclose = () => {
        console.log('WebSocket connection closed');
        setIsConnected(false);
        
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (isRealTimeEnabled) {
            console.log('Attempting to reconnect WebSocket...');
            // The effect will run again and attempt to reconnect
          }
        }, 5000);
      };
      
      newSocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        toast.error('Connection error. Retrying...');
      };
      
      setSocket(newSocket);
      
      // Cleanup function
      return () => {
        console.log('Closing WebSocket connection');
        newSocket.close();
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
      toast.error('Failed to connect to real-time updates');
    }
  }, [isRealTimeEnabled, user]);

  // Send a message through the WebSocket
  const sendMessage = (message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
      toast.error('Not connected to server');
    }
  };

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage, sendMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}
