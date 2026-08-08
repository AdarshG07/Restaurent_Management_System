import { validationResult } from 'express-validator';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

export const createReview = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    return next(new Error(errors.array().map((e) => e.msg).join(', ')));
  }
  const { orderId, foodRating, serviceRating, comment } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    return next(new Error('Order not found'));
  }
  if (order.status !== 'COMPLETED') {
    res.status(400);
    return next(new Error('Feedback allowed only for completed orders'));
  }
  const existing = await Review.findOne({ orderId });
  if (existing) {
    res.status(409);
    return next(new Error('Review already submitted for this order'));
  }
  const review = await Review.create({ orderId, tableNumber: order.tableNumber, foodRating, serviceRating, comment });
  res.status(201).json({ success: true, message: 'Review submitted', data: review });
};

export const listReviews = async (req, res, next) => {
  const reviews = await Review.find().sort({ createdAt: -1 });
  res.json({ success: true, message: 'Reviews loaded', data: reviews });
};
