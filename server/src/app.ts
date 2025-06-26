import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

// Import configurations
import corsOptions from './config/cors';
import swaggerSpec from './config/swagger';
import './config/i18n'; // Initialize i18n

// Import middleware
import { requestIdMiddleware } from './middleware/request-id.middleware';
import { languageMiddleware } from './middleware/language.middleware';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Import utilities
import logger from './utils/logger';
import { isRedisConnected } from './config/redis';

const app = express();

// Trust proxy for accurate IP addresses
app.set('trust proxy', 1);

// Request ID middleware (must be first)
app.use(requestIdMiddleware);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  type: ['application/json', 'text/plain']
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));
app.use(cookieParser());

// Compression
app.use(compression());

// Language detection middleware
app.use(languageMiddleware);

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: {
      write: (message: string) => {
        logger.http(message.trim());
      }
    }
  }));
}

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'E-Commerce API Documentation'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      redis: isRedisConnected() ? 'connected' : 'disconnected',
      // Add more service checks as needed
    },
    requestId: req.id,
  };

  res.status(200).json(healthCheck);
});

// API routes
app.use('/api/v1', (req, res) => {
  res.json({ 
    message: 'E-Commerce API is working!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    requestId: req.id,
  });
});

// 404 handler
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
