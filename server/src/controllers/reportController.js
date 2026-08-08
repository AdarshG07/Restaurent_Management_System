import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';

export const getReports = async (req, res, next) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const dailyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfDay }, 'payment.status': 'PAID' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const weeklyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfWeek }, 'payment.status': 'PAID' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);
  const monthlyRevenue = await Order.aggregate([
    { $match: { createdAt: { $gte: startOfMonth }, 'payment.status': 'PAID' } },
    { $group: { _id: null, total: { $sum: '$total' } } },
  ]);

  const popularDishes = await FoodItem.find().sort({ popularity: -1 }).limit(5).select('name price popularity image');

  const peakHours = await Order.aggregate([
    { $match: { 'payment.status': 'PAID' } },
    { $project: { hour: { $hour: '$createdAt' } } },
    { $group: { _id: '$hour', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  const totalOrders = await Order.countDocuments();
  const pendingOrders = await Order.countDocuments({ status: { $in: ['RECEIVED', 'PREPARING', 'READY_TO_SERVE'] } });
  const completedOrders = await Order.countDocuments({ status: 'COMPLETED' });

  res.json({
    success: true,
    message: 'Reports loaded',
    data: {
      dailyRevenue: dailyRevenue[0]?.total || 0,
      weeklyRevenue: weeklyRevenue[0]?.total || 0,
      monthlyRevenue: monthlyRevenue[0]?.total || 0,
      popularDishes,
      peakHours,
      totalOrders,
      pendingOrders,
      completedOrders,
    },
  });
};
