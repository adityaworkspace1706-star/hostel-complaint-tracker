import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import connectDB from './config/db.js';

// Load env vars
dotenv.config();

import authRoutes from './routes/authRoutes.js';
import complaintRoutes from './routes/complaintRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

const app = express();

// Middleware
app.use(cors());
// 5mb limit: complaints can carry an optional base64 photo attachment.
app.use(express.json({ limit: '5mb' }));

// Basic Route for testing
app.get('/', (req, res) => {
  res.send('HostelCare API is running...');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Centralized error handling: 404 for unknown routes, one handler for all
// errors (never leaks raw 5xx messages to clients).
app.use(notFoundHandler);
app.use(errorHandler);

export default app;

// ---------------------------------------------------------------------------
// Startup — only when executed directly (node server.js / npm run dev), so
// tests can import the app without connecting to MongoDB or listening.
// ---------------------------------------------------------------------------
const isMainModule =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMainModule) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16 || secret === 'your_secret_here') {
    console.error(
      'FATAL: JWT_SECRET is missing or too weak. Set a long random string in backend/.env\n' +
        '       (see backend/.env.example). The server refuses to start without one.'
    );
    process.exit(1);
  }

  connectDB();

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}
