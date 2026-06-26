import mongoose, { Mongoose } from 'mongoose';

const mongoUri: string = process.env.MONGODB_URI as string;

if (!mongoUri) {
  throw new Error('Please define MONGODB_URI in your .env.local');
}

// 1. Tell TypeScript about our global cache object
declare global {
  var mongooseCache: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

// 2. Safely initialize the global object if it doesn't exist yet.
// In Next.js development, 'global' survives file hot-reloads.
if (!global.mongooseCache) {
  global.mongooseCache = {
    conn: null,
    promise: null,
  };
}

// 3. Point our local pointer directly to that global object
const cached = global.mongooseCache;

async function dbConnect(): Promise<Mongoose> {
  // If a connection already exists, reuse it! Don't open a new one.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection isn't in progress, create the promise
  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
    });
  }

  // Wait for the connection to complete and save it to the cache
  cached.conn = await cached.promise;

  return cached.conn;
}

export default dbConnect;