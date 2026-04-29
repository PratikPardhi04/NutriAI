import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import mealRoutes from './src/routes/meals.js';
import analysisRoutes from './src/routes/analysis.js';
import userRoutes from './src/routes/users.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();
connectDB();

const app = express();

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many attempts, try again in 15 minutes' } });
const apiLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const scanLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, message: { message: 'Scan limit reached, try again in an hour' } });

app.use(helmet());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    
    // Always allow localhost in development
    if (process.env.NODE_ENV !== 'production') return callback(null, true);

    const allowedOrigins = process.env.CLIENT_ORIGIN 
      ? process.env.CLIENT_ORIGIN.split(',').map(url => url.trim()) 
      : [];

    // Allow if it's in the list, or if it's ANY Vercel preview deployment
    if (
      allowedOrigins.includes(origin) || 
      origin.endsWith('.vercel.app') || 
      allowedOrigins.length === 0
    ) {
      return callback(null, true);
    }

    callback(null, false);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get("/", (req, res) => {
  res.send("NutriAI API is running!");
});

// Health check (no auth, for uptime monitors)
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth',            authLimiter, authRoutes);
app.use('/api/analysis/scan',   scanLimiter);
app.use('/api',                 apiLimiter);
app.use('/api/meals',           mealRoutes);
app.use('/api/analysis',        analysisRoutes);
app.use('/api/users',           userRoutes);

app.use(errorHandler);

const port = process.env.PORT || 5000;
const server = app.listen(port, '0.0.0.0', () =>
  console.log(`NutriAI running on port ${port} [${process.env.NODE_ENV || 'development'}]`)
);

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down gracefully...');
  server.close(async () => {
    const mongoose = (await import('mongoose')).default;
    await mongoose.connection.close();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000);
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('unhandledRejection', (reason) => console.error('Unhandled rejection:', reason));
