import express, { Application } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import chatroomRoutes from './routes/chatroomRoutes';
import messageRoutes from './routes/messageRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import logger from './utils/logger';

const app: Application = express();

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (frontend)
app.use(express.static('public'));

// Request logging
app.use((req, _, next) => {
  logger.debug(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (_, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chatrooms', chatroomRoutes);
app.use('/api/messages', messageRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;