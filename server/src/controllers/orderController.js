import { validationResult } from 'express-validator';
import Order from '../models/Order.js';
import FoodItem from '../models/FoodItem.js';
import Table from '../models/Table.js';
import { LOW_STOCK_THRESHOLD } from '../config/constants.js';
import { emitOrderUpdate, emitNotification } from '../sockets/socketHandler.js';

const calculateTotals = (items, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + gst - discount).toFixed(2));
  return { subtotal, gst, total };
};

export const listOrders = async (req, res, next) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, message: 'Orders loaded', data: orders });
};

export const getOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id).lean();

  if (!order) {
    res.status(404);
    return next(new Error('Order not found'));
  }

  if (order.payment) {
    delete order.payment.raw;
  }

  res.json({
    success: true,
    message: 'Order loaded',
    data: order
  });
};

export const createOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    return next(new Error(errors.array().map((e) => e.msg).join(', ')));
  }
  const { tableNumber, items, customerNotes, discount } = req.body;
  if (!items || !items.length) {
    res.status(400);
    return next(new Error('Order items are required'));
  }

  const parsedDiscount = Number(discount || 0);
  if (!Number.isFinite(parsedDiscount) || parsedDiscount < 0) {
    res.status(400);
    return next(new Error('Discount must be zero or greater'));
  }
  const table = await Table.findOne({ number: tableNumber });
  if (!table) {
    res.status(404);
    return next(new Error('Table not found'));
  }
  const orderItems = [];
  for (const item of items) {
    const food = await FoodItem.findById(item.foodId);
    if (!food || !food.isAvailable) {
      res.status(400);
      return next(new Error(`Item unavailable: ${item.name || 'Unknown'}`));
    }
    orderItems.push({
      food: food._id,
      name: food.name,
      image: food.image,
      price: food.price,
      quantity: item.quantity,
      instructions: item.instructions || '',
    });
    
    food.popularity += item.quantity;

if (typeof food.stockQuantity === 'number') {
  if (food.stockQuantity < item.quantity) {
    res.status(400);
    return next(new Error(`Insufficient stock: ${food.name}`));
  }

  food.stockQuantity -= item.quantity;

  if (food.stockQuantity === 0) {
    food.isAvailable = false;
  }

  const isLowStock =
    food.stockQuantity > 0 &&
    food.stockQuantity <= LOW_STOCK_THRESHOLD;

  if (isLowStock) {
    emitNotification({
      title: 'Low Stock',
      message: `${food.name} has only ${food.stockQuantity} items remaining.`,
      type: 'low-stock',
    });
  }
}

await food.save();
  }
  const totals = calculateTotals(orderItems, parsedDiscount);
  if (parsedDiscount > totals.subtotal) {
    res.status(400);
    return next(new Error('Discount cannot exceed the subtotal'));
  }

  const newOrder = await Order.create({
    tableNumber,
    items: orderItems,
    subtotal: totals.subtotal,
    gst: totals.gst,
    total: totals.total,
    discount: parsedDiscount,
    customerNotes: customerNotes || '',
    payment: { amount: totals.total, status: 'PENDING', method: 'Unpaid' },
  });
  table.status = 'OCCUPIED';
  await table.save();
  emitOrderUpdate(newOrder);
  emitNotification({ title: 'New order received', message: `Order ${newOrder._id} is waiting`, type: 'order' });
  res.status(201).json({ success: true, message: 'Order placed', data: newOrder });
};

export const updateOrderStatus = async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    return next(new Error('Order not found'));
  }
  const validStatuses = ['RECEIVED', 'PREPARING', 'READY_TO_SERVE', 'SERVED', 'COMPLETED', 'CANCELLED'];
  const { status } = req.body;
  if (!validStatuses.includes(status)) {
    res.status(400);
    return next(new Error('Invalid status'));
  }
  order.status = status;
  if (status === 'COMPLETED' || status === 'CANCELLED') {
    const table = await Table.findOne({ number: order.tableNumber });
    if (table) {
      table.status = 'AVAILABLE';
      await table.save();
    }
  }
  await order.save();
  emitOrderUpdate(order);
  emitNotification({ title: `Order ${status}`, message: `Order ${order._id} is now ${status.replaceAll('_', ' ')}`, type: 'order' });
  res.json({ success: true, message: 'Order status updated', data: order });
};

export const createManualOrder = async (req, res, next) => {
  const { tableNumber, items, discount, customerNotes } = req.body;
  req.body.customerNotes = customerNotes || 'Manual order created by admin';
  req.body.discount = discount || 0;
  req.body.createdByAdmin = true;
  return createOrder(req, res, next);
};

export const updatePreparationTime = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    return next(new Error('Order not found'));
  }

  const minutes = Number(req.body.estimatedMinutes);

  if (!Number.isFinite(minutes) || minutes < 1) {
    res.status(400);
    return next(new Error('Preparation time must be at least 1 minute'));
  }

  order.estimatedMinutes = Math.round(minutes);

  await order.save();

  emitOrderUpdate(order);

  res.json({
    success: true,
    message: 'Preparation time updated',
    data: order,
  });
};
