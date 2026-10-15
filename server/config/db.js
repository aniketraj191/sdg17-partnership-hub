import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  if (mongoose.connection && mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI;

  try {
    // Check if the URI is a dummy placeholder or if no URI provided
    const isPlaceholder = !uri || uri.includes('username:password') || uri.includes('demo:demo') || uri.includes('<db_password>');

    if (!isPlaceholder) {
      console.log('Connecting to MongoDB Atlas at configured MONGODB_URI...');
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 30000,
      });
      console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host} (Database: ${conn.connection.name})`);
      return conn;
    } else {
      console.log('[Database] Notice: MONGODB_URI has placeholder credentials.');
      console.log('[Database] Initializing MongoDB Memory Server for local development/testing...');
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create();
      const inMemoryUri = memoryServer.getUri();
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`[Database] Local In-Memory MongoDB Started at: ${inMemoryUri}`);
      console.log('[Database] -> To connect to your real MongoDB Atlas cluster, update MONGODB_URI in server/.env with your connection string.');
      return conn;
    }
  } catch (error) {
    console.warn(`[Database] Atlas connection failed (${error.message}).`);
    
    // In development mode, fallback to in-memory server so developer can test immediately
    if (process.env.NODE_ENV !== 'production' && !memoryServer) {
      try {
        console.log('[Database] Attempting fallback to In-Memory MongoDB Server for offline testing...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        memoryServer = await MongoMemoryServer.create();
        const inMemoryUri = memoryServer.getUri();
        const conn = await mongoose.connect(inMemoryUri);
        console.log(`[Database] Connected to In-Memory MongoDB: ${inMemoryUri}`);
        return conn;
      } catch (innerError) {
        console.error('[Database] In-memory fallback failed:', innerError.message);
      }
    }

    console.error('[Database] Critical: Could not establish database connection.');
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
    console.log('[Database] MongoDB connection closed.');
  } catch (error) {
    console.error('[Database] Disconnection error:', error);
  }
};
