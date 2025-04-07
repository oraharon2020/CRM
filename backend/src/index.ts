import express, { Express, Request, Response, NextFunction, json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { testConnection } from './config/database';
import { initializeDatabase } from './database/init-db';
import productCacheModel from './models/product-cache.model';
import { calendarEventModel } from './models/calendar-event.model';
import { integrationSettingsModel } from './models/integration-settings.model';
import { startSyncProductCacheJob } from './jobs/sync-product-cache.job';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import orderRoutes from './routes/order.routes';
import storeRoutes from './routes/store.routes';
import calendarRoutes from './routes/calendar.routes';
import leadRoutes from './routes/lead.routes';
import settingsRoutes from './routes/settings.routes';
import analyticsRoutes from './routes/analytics.routes';
import analyticsIntegrationsRoutes from './routes/analytics-integrations.routes';
import wooCommerceRoutes from './routes/woocommerce.routes';
import dashboardRoutes from './routes/dashboard.routes';
import cashFlowRoutes from './routes/cashflow.routes';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
// Use a different approach for PORT to avoid issues with type annotations being stripped
let PORT = 3001;
if (process.env.PORT) {
  PORT = parseInt(process.env.PORT);
}

// Test database connection and initialize tables
testConnection();

// Initialize tables
(async () => {
  try {
    // Initialize product cache table
    await productCacheModel.initTable();
    console.log('Product cache table initialized on startup');
    
    // Initialize calendar events table
    await calendarEventModel.createTable();
    console.log('Calendar events table initialized on startup');
    
    // Initialize integration settings tables
    await integrationSettingsModel.createTables();
    console.log('Integration settings tables initialized on startup');
    
    // Start the scheduled job for product cache sync
    startSyncProductCacheJob();
  } catch (error) {
    console.error('Error initializing tables:', error);
  }
})();

// Create CORS options object
const corsOptions = {
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow all localhost origins regardless of port
    if (origin.startsWith('http://localhost:') || origin.startsWith('https://localhost:')) {
      return callback(null, true);
    }
    
    // Allow specific origins from environment variable
    let allowedOrigins = [];
    if (process.env.CORS_ORIGIN) {
      allowedOrigins = process.env.CORS_ORIGIN.split(',');
    }
    if (allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    // Default allowed origins
    const defaultAllowed = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5177'];
    if (defaultAllowed.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization', 'X-API-Key'],
  exposedHeaders: ['Content-Length', 'X-Total-Count'],
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// CORS configuration - must come before other middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors());

// Configure Helmet but disable features that interfere with CORS
// Create Helmet options object
const helmetOptions = {
  crossOriginResourcePolicy: {
    policy: 'cross-origin'
  },
  crossOriginOpenerPolicy: {
    policy: 'unsafe-none'
  },
  contentSecurityPolicy: false
};

// Apply Helmet middleware
// @ts-ignore - Helmet types are not compatible with Express types
app.use(helmet(helmetOptions));

// Other middleware
app.use(json());
app.use(urlencoded({ extended: true }));
app.use(compression());
app.use(morgan('dev'));

// Rate limiting
// Create rate limit options object
const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // increased limit from 1000 to 5000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
};

// Apply rate limiting middleware
const limiter = rateLimit(rateLimitOptions);
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/analytics/integrations', analyticsIntegrationsRoutes);
app.use('/api/woocommerce', wooCommerceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/cashflow', cashFlowRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  // Create health check response object
  const healthResponse = {
    status: 'ok',
    timestamp: new Date().toISOString()
  };
  
  res.status(200).json(healthResponse);
});

// Backward compatibility for webhook routes
app.post('/api/webhook/:integrationType', (req, res) => {
  console.log(`Redirecting webhook request from ${req.originalUrl} to /api/leads/webhook`);
  
  // Preserve the original API key header if it exists
  const apiKey = req.header('X-API-Key');
  
  // Forward the request to the correct webhook endpoint
  req.url = '/api/leads/webhook';
  
  // Log the request for debugging
  console.log(`Request body: ${JSON.stringify(req.body)}`);
  console.log(`API Key: ${apiKey || 'Not provided'}`);
  
  app._router.handle(req, res);
});

// 404 handler
app.use((req, res) => {
  // Create 404 response object
  const notFoundResponse = {
    message: 'Route not found'
  };
  
  res.status(404).json(notFoundResponse);
});

// Error handler
// @ts-ignore - Error handler needs 4 parameters
app.use((err, req, res, next) => {
  console.error(err.stack);
  let errorDetails = undefined;
  if (process.env.NODE_ENV === 'development') {
    errorDetails = err.message;
  }
  // Create error response object
  const errorResponse = {
    message: 'Internal Server Error',
    error: errorDetails
  };
  
  res.status(500).json(errorResponse);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
