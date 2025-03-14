'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, walletAddress, isAuthenticating, connectWallet, disconnectWallet } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Format wallet address for display
  const formatWalletAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  return (
    <nav className="text-white py-3 shadow-md border-b border-gray-800 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="w-full flex justify-between items-center">
          <div className="flex-none">
            <Link href="/" className="text-xl font-bold text-green-500 tracking-tight lowercase">
              debateai
            </Link>
          </div>
          
          <div className="flex-1"></div>
          
          <div className="flex-none">
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-8">
                <Link 
                  href="/" 
                  className={`text-sm font-medium relative group transition-colors duration-200 ${
                    pathname === '/' ? 'text-green-500' : 'text-gray-300 hover:text-green-500'
                  }`}
                >
                  home
                  <span className={`absolute -bottom-1 left-0 w-full h-[2px] bg-green-500 transform origin-left transition-transform duration-300 ${
                    pathname === '/' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </Link>
                <Link 
                  href="/voting" 
                  className={`text-sm font-medium relative group transition-colors duration-200 ${
                    pathname === '/voting' ? 'text-green-500' : 'text-gray-300 hover:text-green-500'
                  }`}
                >
                  voting
                  <span className={`absolute -bottom-1 left-0 w-full h-[2px] bg-green-500 transform origin-left transition-transform duration-300 ${
                    pathname === '/voting' ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}></span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative" ref={dropdownRef}>
                  {isAuthenticated ? (
                    <button 
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 overflow-hidden rounded-md border border-green-500 text-green-500 h-9 text-sm px-3 hover:bg-green-500/10 transition-colors duration-200"
                      style={{ fontFamily: 'var(--font-geist-mono)' }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                        <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                        <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                      </svg>
                      <span className="truncate max-w-[120px]" title={walletAddress}>
                        {formatWalletAddress(walletAddress)}
                      </span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto size-4">
                        <path d="m7 15 5 5 5-5"></path>
                        <path d="m7 9 5-5 5 5"></path>
                      </svg>
                    </button>
                  ) : (
                    <button 
                      onClick={connectWallet}
                      disabled={isAuthenticating}
                      className="flex items-center gap-2 overflow-hidden rounded-md border border-green-500 text-green-500 h-9 text-sm px-3 hover:bg-green-500/10 transition-colors duration-200"
                      style={{ fontFamily: 'var(--font-geist-mono)' }}
                    >
                      {isAuthenticating ? (
                        <>
                          <svg className="animate-spin size-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>connecting...</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                            <polyline points="10 17 15 12 10 7"></polyline>
                            <line x1="15" x2="3" y1="12" y2="12"></line>
                          </svg>
                          <span>connect wallet</span>
                        </>
                      )}
                    </button>
                  )}
                  
                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 min-w-48 rounded-lg overflow-hidden border border-gray-700 bg-black p-2 text-white shadow-lg z-50 animate-fadeIn" 
                         style={{ fontFamily: 'var(--font-geist-mono)' }}>
                      <div className="p-2">
                        <div className="flex items-center gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-green-500">
                            <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"></path>
                            <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"></path>
                          </svg>
                          <span className="text-sm">{formatWalletAddress(walletAddress)}</span>
                        </div>
                      </div>
                      <div className="-mx-1 my-1 h-px bg-gray-700"></div>
                      <div className="p-2">
                        <button 
                          onClick={() => {
                            disconnectWallet();
                            setDropdownOpen(false);
                          }}
                          className="flex items-center gap-2 text-sm w-full text-left hover:text-red-400 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" x2="9" y1="12" y2="12"></line>
                          </svg>
                          <span>log out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
