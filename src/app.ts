/**
 * Express server configuration and startup
 */

import 'dotenv/config';
import express from 'express';
import cors from "cors";
import apiRoutes from "./routes/api";
import publicRoutes from "./routes/public";
import {
  database,
  setDatabaseMode,
  getDatabaseMode,
  DatabaseMode,
} from "./database";
import { connectToMongoDB, getConnectionStatus } from "./config/database";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
// Enable CORS for all origins
app.use(cors());
app.use(express.json());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: {
      mode: getDatabaseMode(),
      status: getDatabaseMode() === 'mongodb' ? getConnectionStatus() : 'active',
    },
  });
});

// API routes
app.use('/api/verify', apiRoutes);

// Public verification result routes
app.use('/verify', publicRoutes);

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    name: 'TitoProof Backend',
    version: '0.1.0',
    description:
      'Verification infrastructure for website ownership and domain validation',
    database: getDatabaseMode(),
    endpoints: {
      health: {
        path: '/health',
        method: 'GET',
        description: 'Health check endpoint',
      },
      generateToken: {
        path: '/api/verify/generate-token',
        method: 'POST',
        description: 'Generate a verification token for a domain',
        body: { domain: 'string', methods: 'string[] (optional)' },
      },
      verifyDomain: {
        path: '/api/verify/verify-domain',
        method: 'POST',
        description: 'Verify domain ownership using a token',
        body: {
          domain: 'string',
          method: 'DNS_TXT | HTML_META',
          token: 'string',
        },
      },
      getStatus: {
        path: '/api/verify/status/:domain',
        method: 'GET',
        description: 'Get verification status for a domain',
      },
      verifyEmail: {
        path: '/api/verify/email-domain',
        method: 'POST',
        description: 'Verify email domain against verified website',
        body: { email: 'string', domain: 'string' },
      },
      publicStatus: {
        path: '/verify/:domain',
        method: 'GET',
        description: 'Public verification status page for a domain',
      },
    },
    documentation: 'See README.md for complete documentation',
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

/**
 * Start the server
 */
export async function startServer(): Promise<void> {
  // Set database mode from environment
  const dbMode = (process.env.DATABASE_MODE || 'memory') as DatabaseMode;
  setDatabaseMode(dbMode);

  // Connect to MongoDB if configured
  if (dbMode === 'mongodb') {
    try {
      await connectToMongoDB();
    } catch (error) {
      console.error('Failed to connect to MongoDB. Falling back to in-memory database.');
      setDatabaseMode('memory');
    }
  }

  app.listen(PORT, () => {
    console.log(`\n🚀 TitoProof Backend running at http://localhost:${PORT}`);
    console.log(`📚 API Documentation: http://localhost:${PORT}`);
    console.log(`💚 Health Check: http://localhost:${PORT}/health`);
    console.log(`📦 Database Mode: ${getDatabaseMode()}\n`);
  });

  // Cleanup expired tokens periodically (every hour)
  setInterval(async () => {
    await Promise.resolve(database.cleanupExpiredTokens());
    console.log('[Cleanup] Expired tokens cleaned up');
  }, 60 * 60 * 1000);
}

export default app;
