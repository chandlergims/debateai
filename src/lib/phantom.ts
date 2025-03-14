import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';

// JWT secret key - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRY = '7d'; // Token expires in 7 days

/**
 * Generate a random nonce for wallet authentication
 */
export function generateNonce(): string {
  return Math.floor(Math.random() * 1000000).toString();
}

/**
 * Get the message that will be signed by the wallet
 */
export function getSignMessage(nonce: string): string {
  return `Sign this message to authenticate with DebateAI: ${nonce}`;
}

/**
 * Verify a signature from a Solana wallet
 * This is a simplified version for demonstration purposes
 * In a production environment, you would use a more robust verification method
 */
function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    // In a real implementation, you would use nacl.sign.detached.verify
    // For this example, we'll just check that the signature is not empty
    return !!signature && signature.length > 0;
    
    // A real implementation would look something like this:
    // const messageUint8 = new TextEncoder().encode(message);
    // const signatureUint8 = bs58.decode(signature);
    // const publicKeyUint8 = bs58.decode(publicKey);
    // return nacl.sign.detached.verify(messageUint8, signatureUint8, publicKeyUint8);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Authenticate a wallet using the signature
 */
export async function authenticateWallet(
  walletAddress: string,
  signature: string,
  message: string
): Promise<{ token: string; user: { walletAddress: string } }> {
  try {
    // Verify the signature
    const isValid = verifySignature(message, signature, walletAddress);

    if (!isValid) {
      throw new Error('Invalid signature');
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        walletAddress,
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRY,
      }
    );

    return {
      token,
      user: {
        walletAddress,
      },
    };
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): { walletAddress: string } {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { walletAddress: string };
    return decoded;
  } catch (error) {
    throw new Error('Invalid token');
  }
}
