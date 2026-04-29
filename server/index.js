import express from 'express';

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

// 1. Universal CORS Middleware (Must be at the TOP)
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    "https://nutri-ai-seven-tau.vercel.app",
    "http://localhost:5173",
  ];

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  } else {
    res.header("Access-Control-Allow-Origin", "https://nutri-ai-seven-tau.vercel.app");
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(helmet());

// Rate limiters
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { message: 'Too many attempts, try again in 15 minutes' } });
const apiLimiter  = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
const scanLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 30, message: { message: 'Scan limit reached, try again in an hour' } });
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get("/", (req, res) => {
  res.send("NutriAI API is running!");
});

app.get("/api", (req, res) => {
  res.json({ message: "NutriAI API Root", status: "ok" });
});

// Health check (no auth, for uptime monitors)
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// API Routes
app.use('/api/auth',            authLimiter, authRoutes);
app.use('/api/analysis/scan',   scanLimiter); // Note: scan path for limiter only
app.use('/api/meals',           apiLimiter, mealRoutes);
app.use('/api/analysis',        apiLimiter, analysisRoutes);
app.use('/api/users',           apiLimiter, userRoutes);

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
