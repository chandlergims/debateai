'use client';

import { useState } from 'react';

export default function DebateHistory() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className={`h-[calc(100vh-53px)] bg-black border-r border-gray-800 transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'}`}>
      <div className="p-4 text-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-sm font-medium text-green-500 uppercase">debate history</h2>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-400 hover:text-white"
          >
            {isOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6"></path>
              </svg>
            )}
          </button>
        </div>
        
        {/* Debate history content will go here */}
        <div className="text-gray-400 text-sm">
          {isOpen && (
            <div className="flex flex-col space-y-2">
              <p className="text-center text-gray-500 italic">No debates yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
