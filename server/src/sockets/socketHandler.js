import jwt from 'jsonwebtoken';
import Notification from '../models/Notification.js';
import Admin from '../models/Admin.js';

let io;
const orderRoom = 'orders';

const validateAdminSocket = async (socket) => {
  const token = socket.handshake.auth?.token;
  if (!token) return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    return !!admin;
  } catch (error) {
    return false;
  }
};

export const initSocket = (serverIo) => {
  io = serverIo;
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);
    socket.on('joinTable', (tableId) => {
      socket.join(`table_${tableId}`);
    });
    socket.on('joinAdmin', async () => {
      if (await validateAdminSocket(socket)) {
        socket.join('admin');
      }
    });
    socket.on('leaveTable', (tableId) => {
      socket.leave(`table_${tableId}`);
    });
    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

export const emitOrderUpdate = (order) => {
  if (!io) return;
  io.to(`table_${order.tableNumber}`).emit('orderUpdate', order);
  io.to('admin').emit('orderUpdate', order);
};

export const emitNotification = async (notification) => {
  if (!io) return;
  try {
    const savedNotification = await Notification.create(notification);
    io.to('admin').emit('notification', savedNotification);
  } catch (error) {
    console.error('Failed to save notification:', error);
    io.to('admin').emit('notification', { ...notification, createdAt: new Date().toISOString(), read: false });
  }
};
