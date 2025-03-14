'use client';

import { useState, useEffect } from 'react';
import { PeriodStatus } from '@/models/Topic';

interface PeriodTimerProps {
  nextPeriodChange: string;
  currentPeriod: PeriodStatus;
  winningTopic?: {
    title: string;
    votes: number;
  };
}

export default function PeriodTimer({ nextPeriodChange, currentPeriod, winningTopic }: PeriodTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showWinningTopic, setShowWinningTopic] = useState<boolean>(false);
  
  useEffect(() => {
    // Calculate initial time remaining
    const endTime = new Date(nextPeriodChange).getTime();
    const now = new Date().getTime();
    const initialTimeRemaining = Math.max(0, endTime - now);
    setTimeRemaining(initialTimeRemaining);
    
    // Set up interval to update time remaining
    const intervalId = setInterval(() => {
      const now = new Date().getTime();
      const remaining = Math.max(0, endTime - now);
      setTimeRemaining(remaining);
      
      // Show winning topic when there's less than 10 seconds left in voting period
      if (currentPeriod === PeriodStatus.VOTING && remaining < 10000 && remaining > 0 && winningTopic) {
        setShowWinningTopic(true);
      } else if (remaining === 0) {
        // Reset when timer reaches 0
        setShowWinningTopic(false);
      }
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [nextPeriodChange, currentPeriod, winningTopic]);
  
  // Format time remaining as MM:SS
  const formatTimeRemaining = () => {
    const totalSeconds = Math.floor(timeRemaining / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate progress percentage (0-100)
  const calculateProgress = () => {
    const totalDuration = 5 * 60 * 1000; // 5 minutes in milliseconds
    const elapsed = totalDuration - timeRemaining;
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
              {currentPeriod === PeriodStatus.VOTING ? 'Voting Period' : 'Debate Period'}
            </h3>
            <div className="text-xs text-gray-400">
              {currentPeriod === PeriodStatus.VOTING 
                ? 'Next debate in:' 
                : 'Next voting round in:'}
            </div>
          </div>
          
          <div className="flex justify-center items-center">
            <div className="text-3xl font-bold text-white">
              {formatTimeRemaining()}
            </div>
          </div>
        </div>
      </div>
      
      {/* Winning topic announcement */}
      {showWinningTopic && winningTopic && (
        <div className="mt-4 p-4 bg-green-900/30 border border-green-800 rounded-lg animate-pulse">
          <h3 className="text-sm font-medium text-green-500 mb-1">Winning Topic:</h3>
          <p className="text-white font-bold">{winningTopic.title}</p>
          <div className="mt-2 bg-gray-900 text-green-500 px-2 py-0.5 rounded text-xs font-medium inline-block">
            {winningTopic.votes} votes
          </div>
        </div>
      )}
    </div>
  );
}
