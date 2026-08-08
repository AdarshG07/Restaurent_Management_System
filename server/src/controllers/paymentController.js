import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import { validationResult } from 'express-validator';
import crypto from 'crypto';
import { emitNotification } from '../sockets/socketHandler.js';

const razorpay = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

export const createPaymentOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    return next(new Error(errors.array().map((e) => e.msg).join(', ')));
  }

  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    return next(new Error('Order not found'));
  }
  if (order.payment?.status === 'PAID') {
    res.status(400);
    return next(new Error('Order is already paid'));
  }
  if (!razorpay) {
    res.status(500);
    return next(new Error('Razorpay is not configured on the server'));
  }

  const amount = Math.round(order.total * 100);
  if (amount <= 0) {
    res.status(400);
    return next(new Error('Order amount must be greater than zero'));
  }

  const options = {
    amount,
    currency: 'INR',
    receipt: `receipt_${order._id}`,
    notes: { orderId: order._id.toString(), tableNumber: order.tableNumber },
  };
  const paymentOrder = await razorpay.orders.create(options);

  order.payment = {
    ...order.payment,
    status: 'PENDING',
    method: 'Razorpay',
    amount: order.total,
    raw: { razorpayOrderId: paymentOrder.id },
  };
  await order.save();

  res.json({ success: true, message: 'Payment order created', data: paymentOrder });
};

export const verifyPayment = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    return next(new Error(errors.array().map((e) => e.msg).join(', ')));
  }

  const { orderId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;
  const order = await Order.findById(orderId);
  if (!order) {
    res.status(404);
    return next(new Error('Order not found'));
  }
  if (order.payment?.status === 'PAID') {
    res.status(400);
    return next(new Error('Order has already been paid'));
  }
  const storedRazorpayOrderId = order.payment?.raw?.razorpayOrderId;

if (!storedRazorpayOrderId) {
  res.status(400);
  return next(new Error('Razorpay order reference not found'));
}

if (storedRazorpayOrderId !== razorpayOrderId) {
  res.status(400);
  return next(new Error('Razorpay order mismatch'));
}

  if (!process.env.RAZORPAY_KEY_SECRET) {
    res.status(500);
    return next(new Error('Razorpay secret is not configured on the server'));
  }

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    order.payment = {
      ...order.payment,
      status: 'FAILED',
      method: 'Razorpay',
      amount: order.total,
      raw: { razorpayOrderId, razorpayPaymentId, razorpaySignature },
    };
    await order.save();
    res.status(400);
    return next(new Error('Invalid Razorpay signature'));
  }

  order.payment = {
    ...order.payment,
    paymentId: razorpayPaymentId,
    method: 'Razorpay',
    status: 'PAID',
    amount: order.total,
    raw: { razorpayOrderId, razorpayPaymentId, razorpaySignature },
  };
  await order.save();

  emitNotification({ title: 'Payment received', message: `Payment success for order ${order._id}`, type: 'payment' });
  res.json({ success: true, message: 'Payment verified', data: order });
};

export const getPaymentStatus = async (req, res, next) => {
  const order = await Order.findById(req.params.orderId).lean();

  if (!order) {
    res.status(404);
    return next(new Error('Order not found'));
  }

  const payment = order.payment ? { ...order.payment } : null;

  if (payment) {
    delete payment.raw;
  }

  res.json({
    success: true,
    message: 'Payment status',
    data: payment,
  });
};
