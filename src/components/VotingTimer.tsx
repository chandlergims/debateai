'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface VotingSession {
  startTime: number;
  endTime: number;
}

export default function VotingTimer() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [sessionInfo, setSessionInfo] = useState<VotingSession | null>(null);
  
  // Connect to the WebSocket server
  useEffect(() => {
    // Create socket connection
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002');
    setSocket(newSocket);
    
    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  // Listen for voting session updates
  useEffect(() => {
    if (!socket) return;
    
    // Listen for voting session updates
    socket.on('votingSessionUpdate', (data: VotingSession) => {
      setSessionInfo(data);
    });
    
    // Clean up on unmount
    return () => {
      socket.off('votingSessionUpdate');
    };
  }, [socket]);
  
  // Update the timer every second
  useEffect(() => {
    if (!sessionInfo) return;
    
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, sessionInfo.endTime - now);
      setTimeRemaining(remaining);
    };
    
    // Update immediately
    updateTimer();
    
    // Set up interval to update time remaining
    const intervalId = setInterval(updateTimer, 1000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [sessionInfo]);
  
  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const totalSeconds = Math.floor(timeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage (0-100)
  const calculateProgress = () => {
    if (!sessionInfo) return 0;
    
    const totalDuration = sessionInfo.endTime - sessionInfo.startTime;
    const elapsed = Date.now() - sessionInfo.startTime;
    return Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  };
  
  return (
    <div className="mb-8 mt-4">
      <div className="bg-black border border-gray-800 rounded-lg p-4 relative overflow-hidden">
        {/* Progress bar */}
        <div 
          className="absolute inset-0 bg-green-900/20 transition-all duration-1000 ease-linear"
          style={{ width: `${calculateProgress()}%` }}
        />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-green-500">
              Voting Period
            </h3>
            <div className="text-xs text-gray-400">
              Topics reset in:
            </div>
          </div>
          
          <div className="flex justify-center items-center">
            <div className="text-3xl font-bold text-white">
              {formatTimeRemaining()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
