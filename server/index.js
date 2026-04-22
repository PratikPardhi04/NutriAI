import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './src/config/db.js';
import authRoutes from './src/routes/auth.js';
import mealRoutes from './src/routes/meals.js';
import analysisRoutes from './src/routes/analysis.js';
import userRoutes from './src/routes/users.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(cors({ 
  origin: (origin, callback) => {
    // Allow any origin in development to support mobile testing
    if (!origin || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(null, process.env.CLIENT_ORIGIN);
  }, 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

app.use('/api/auth',     authRoutes);
app.use('/api/meals',    mealRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/users',    userRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`NutriAI server running on port ${PORT}`));
