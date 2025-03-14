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
      
      // First check if the test API is working
      try {
        const testResponse = await fetch('/api/test');
        if (!testResponse.ok) {
          console.warn('API routes are not available. Using mock authentication.');
          
          // Use mock authentication
          const mockToken = 'mock_token_' + Math.random().toString(36).substring(2, 15);
          
          // Store authentication data
          localStorage.setItem('authToken', mockToken);
          localStorage.setItem('walletAddress', walletAddress);
          
          setAuthToken(mockToken);
          setWalletAddress(walletAddress);
          setIsAuthenticated(true);
          
          return;
        }
      } catch (error) {
        console.warn('API test failed. Using mock authentication.', error);
        
        // Use mock authentication
        const mockToken = 'mock_token_' + Math.random().toString(36).substring(2, 15);
        
        // Store authentication data
        localStorage.setItem('authToken', mockToken);
        localStorage.setItem('walletAddress', walletAddress);
        
        setAuthToken(mockToken);
        setWalletAddress(walletAddress);
        setIsAuthenticated(true);
        
        return;
      }
      
      // Get nonce from server
      const nonceResponse = await fetch(`/api/auth/nonce?walletAddress=${walletAddress}`);
      if (!nonceResponse.ok) {
        // If we get a 404, the API route might not be registered yet
        if (nonceResponse.status === 404) {
          console.warn('Nonce API not available. Using mock authentication.');
          
          // Use mock authentication
          const mockToken = 'mock_token_' + Math.random().toString(36).substring(2, 15);
          
          // Store authentication data
          localStorage.setItem('authToken', mockToken);
          localStorage.setItem('walletAddress', walletAddress);
          
          setAuthToken(mockToken);
          setWalletAddress(walletAddress);
          setIsAuthenticated(true);
          
          return;
        }
        
        throw new Error('Failed to get authentication nonce');
      }
      
      const { nonce } = await nonceResponse.json();
      
      // Create message to sign
      const message = `Sign this message to authenticate with DebateAI: ${nonce}`;
      
      // Sign the message with Phantom
      const encodedMessage = new TextEncoder().encode(message);
      const signatureData = await phantom.signMessage(encodedMessage);
      
      // Convert the signature to a hex string
      const signature = Array.from(new Uint8Array(signatureData.signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
      // Authenticate with the server
      const authResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          signature,
        }),
      });
      
      if (!authResponse.ok) {
        // If we get a 404, the API route might not be registered yet
        if (authResponse.status === 404) {
          console.warn('Login API not available. Using mock authentication.');
          
          // Use mock authentication
          const mockToken = 'mock_token_' + Math.random().toString(36).substring(2, 15);
          
          // Store authentication data
          localStorage.setItem('authToken', mockToken);
          localStorage.setItem('walletAddress', walletAddress);
          
          setAuthToken(mockToken);
          setWalletAddress(walletAddress);
          setIsAuthenticated(true);
          
          return;
        }
        
        throw new Error('Authentication failed');
      }
      
      const { token } = await authResponse.json();
      
      // Store authentication data
      localStorage.setItem('authToken', token);
      localStorage.setItem('walletAddress', walletAddress);
      
      setAuthToken(token);
      setWalletAddress(walletAddress);
      setIsAuthenticated(true);
      
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
