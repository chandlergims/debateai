interface PhantomProvider {
  isPhantom?: boolean;
  solana?: {
    connect: () => Promise<{ publicKey: { toString: () => string } }>;
    disconnect: () => Promise<void>;
    signMessage: (message: Uint8Array) => Promise<{ 
      signature: Uint8Array;
      publicKey: { toString: () => string };
    }>;
  };
}

interface Window {
  phantom?: PhantomProvider;
}
