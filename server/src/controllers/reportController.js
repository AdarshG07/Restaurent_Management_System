import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';

export const getReports = async (req, res, next) => {
  try {
    const now = new Date();

    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());

    const startOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

    // Daily revenue
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay },
          status: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);

    // Weekly revenue
    const weeklyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfWeek },
          status: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);

    // Monthly revenue
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: 'COMPLETED',
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);

    // Best-selling dishes
    const popularDishes = await FoodItem.find()
      .sort({ popularity: -1 })
      .limit(5)
      .select('name price popularity image');

    // Peak hours based on completed orders
    const peakHours = await Order.aggregate([
      {
        $match: {
          status: 'COMPLETED',
        },
      },
      {
        $project: {
          hour: { $hour: '$createdAt' },
        },
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
    ]);

    const totalOrders = await Order.countDocuments();

    const pendingOrders = await Order.countDocuments({
      status: {
        $in: ['RECEIVED', 'PREPARING', 'READY_TO_SERVE'],
      },
    });

    const completedOrders = await Order.countDocuments({
      status: 'COMPLETED',
    });

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
  } catch (error) {
    next(error);
  }
};