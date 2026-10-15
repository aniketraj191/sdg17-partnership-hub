import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import Project from './models/Project.js';
import { seedDatabase } from './scripts/seed.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
let server;

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is empty so dropdowns and dashboard are immediately populated
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      console.log('[Database] Database is currently empty. Auto-populating initial demonstration data...');
      await seedDatabase(false);
    }

    server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` SDG 17 Partnership Hub Server running on port ${PORT}`);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(` API Endpoint: http://localhost:${PORT}/api`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log(`=======================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

// Handle termination signals
process.on('SIGINT', async () => {
  console.log('\nShutting down server gracefully...');
  if (server) server.close();
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\nProcess terminated...');
  if (server) server.close();
  await disconnectDB();
  process.exit(0);
});
