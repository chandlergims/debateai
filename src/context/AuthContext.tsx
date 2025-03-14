'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  walletAddress: string;
  authToken: string;
  isAuthenticating: boolean;
  error: string;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState('');

  // Check if user has a stored token
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedWallet = localStorage.getItem('walletAddress');
    
    if (storedToken && storedWallet) {
      setAuthToken(storedToken);
      setWalletAddress(storedWallet);
      setIsAuthenticated(true);
    }
  }, []);

  // Connect wallet and authenticate
  const connectWallet = async () => {
    try {
      setIsAuthenticating(true);
      
      // Check if Phantom is available
      const phantom = window.phantom?.solana;
      
      if (!phantom) {
        throw new Error('Phantom wallet is not installed. Please install it from https://phantom.app/');
      }
      
      // Connect to Phantom wallet
      const { publicKey } = await phantom.connect();
      
      if (!publicKey) {
        throw new Error('Failed to connect to Phantom wallet');
      }
      
      // Get wallet address
      const walletAddress = publicKey.toString();
      
      // Use mock authentication directly since we're not using the API routes
      console.info('Using mock authentication for wallet connection');
      
      // Generate a mock token
      const mockToken = 'mock_token_' + Math.random().toString(36).substring(2, 15);
      
      // Store authentication data
      localStorage.setItem('authToken', mockToken);
      localStorage.setItem('walletAddress', walletAddress);
      
      setAuthToken(mockToken);
      setWalletAddress(walletAddress);
      setIsAuthenticated(true);
      
      return;
      
      // Note: We've removed the API authentication flow since we're not using the API routes
      
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Failed to connect wallet');
      setTimeout(() => setError(''), 3000);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('walletAddress');
    setAuthToken('');
    setWalletAddress('');
    setIsAuthenticated(false);
  };

  // Clear error
  const clearError = () => {
    setError('');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        walletAddress,
        authToken,
        isAuthenticating,
        error,
        connectWallet,
        disconnectWallet,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
