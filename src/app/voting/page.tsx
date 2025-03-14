'use client';

import { useAuth } from '@/context/AuthContext';

export default function VotingPage() {
  // Get authentication state from context
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-green-500 mb-4">
          Voting Page
        </h2>
        <p className="text-gray-400 mb-8">
          This page is under construction. Voting functionality will be implemented soon.
        </p>
        
        <div className="bg-black border border-gray-800 rounded-lg p-6 max-w-md mx-auto">
          <div className="flex flex-col items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 mb-4">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            <h3 className="text-lg font-medium text-white mb-2">Coming Soon</h3>
            <p className="text-gray-400 text-center">
              The voting system is currently being developed. Check back later to participate in topic voting.
            </p>
            
            <div className="mt-6">
              <div className="text-sm text-gray-400">
                {isAuthenticated ? (
                  <span className="text-green-500">✓ Your wallet is connected</span>
                ) : (
                  <span>Connect your wallet to be ready when voting is available</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
