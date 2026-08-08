import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './src/config/db.js';
import authRoutes from './src/routes/authRoutes.js';
import tableRoutes from './src/routes/tableRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import menuRoutes from './src/routes/menuRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import billingRoutes from './src/routes/billingRoutes.js';
import reportRoutes from './src/routes/reportRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';
import { errorHandler, notFound } from './src/middleware/errorMiddleware.js';
import { initSocket } from './src/sockets/socketHandler.js';

dotenv.config();
const app = express();
const server = http.createServer(app);
const clientUrl = process.env.CLIENT_URL;
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (clientUrl && origin === clientUrl) return callback(null, true);
    if (!clientUrl && process.env.NODE_ENV !== 'production' && origin === 'http://localhost:5173') return callback(null, true);
    callback(new Error('CORS policy: origin not allowed'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
};
const io = new Server(server, {
  cors: corsOptions,
});

initSocket(io);

connectDB();

app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.use(morgan('dev'));

app.use('/api/auth', authRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/notifications', notificationRoutes);

if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use(express.static(path.join(__dirname, '../client/dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export { io };


