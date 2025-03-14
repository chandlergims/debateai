import mongoose from 'mongoose';

// MongoDB connection string from environment variable
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://link:JkGebcKbho5TvUu6@cluster0.hxfim.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

// Define the connection cache interface
interface ConnectionCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Initialize the connection cache
let cached: ConnectionCache = global.mongooseCache || { conn: null, promise: null };

// Add the cache to the global object to persist across hot reloads
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB using Mongoose
 */
export async function dbConnect(): Promise<typeof mongoose> {
  // If we have an existing connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is already being established, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    // Create a new connection promise
    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    // Wait for the connection to be established
    cached.conn = await cached.promise;
  } catch (e) {
    // If connection fails, clear the promise so we can try again
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Add type definition for global cache
declare global {
  var mongooseCache: ConnectionCache;
}

export default dbConnect;
