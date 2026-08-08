import { validationResult } from 'express-validator';
import CustomBill from '../models/CustomBill.js';

const calculateBill = (items, discount = 0, serviceCharge = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const gst = Number((subtotal * 0.05).toFixed(2));
  const total = Number((subtotal + gst + serviceCharge - discount).toFixed(2));
  return { subtotal, gst, total };
};

export const createCustomBill = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    return next(new Error(errors.array().map((e) => e.msg).join(', ')));
  }
  const { tableNumber, items, discount, serviceCharge, notes } = req.body;
  const billItems = items.map((item) => ({ name: item.name, price: item.price, quantity: item.quantity }));
  const totals = calculateBill(billItems, discount || 0, serviceCharge || 0);
  const bill = await CustomBill.create({
    tableNumber: tableNumber || 'Guest',
    items: billItems,
    subtotal: totals.subtotal,
    gst: totals.gst,
    serviceCharge: serviceCharge || 0,
    discount: discount || 0,
    total: totals.total,
    notes: notes || '',
  });
  res.status(201).json({ success: true, message: 'Custom bill created', data: bill });
};

export const listCustomBills = async (req, res, next) => {
  const bills = await CustomBill.find().sort({ createdAt: -1 });
  res.json({ success: true, message: 'Bills loaded', data: bills });
};

export const getCustomBill = async (req, res, next) => {
  const bill = await CustomBill.findById(req.params.id);
  if (!bill) {
    res.status(404);
    return next(new Error('Bill not found'));
  }
  res.json({ success: true, message: 'Bill loaded', data: bill });
};
