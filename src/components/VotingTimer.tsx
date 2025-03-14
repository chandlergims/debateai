'use client';

import { useState, useEffect } from 'react';

// Hardcoded timer for now - will be replaced with WebSocket later
export default function VotingTimer() {
  const [timeRemaining, setTimeRemaining] = useState<number>(60000); // 60 seconds
  const [startTime] = useState<number>(Date.now());
  const [endTime] = useState<number>(Date.now() + 60000); // 60 seconds from now
  
  // Update the timer every second
  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);
      
      // If timer reaches 0, reset it to 60 seconds
      if (remaining === 0) {
        setTimeRemaining(60000);
      }
    };
    
    // Update immediately
    updateTimer();
    
    // Set up interval to update time remaining
    const intervalId = setInterval(updateTimer, 1000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, [endTime]);
  
  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const totalSeconds = Math.floor(timeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage (0-100)
  const calculateProgress = () => {
    const totalDuration = 60000; // 60 seconds
    const elapsed = Date.now() - startTime;
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
