import { validationResult } from 'express-validator';
import Table from '../models/Table.js';

const createQrId = () => `tbl-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString().slice(-4)}`;

export const listTables = async (req, res, next) => {
  const tables = await Table.find().sort({ number: 1 });
  res.json({ success: true, message: 'Tables loaded', data: tables });
};

export const createTable = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    return next(new Error(errors.array().map((e) => e.msg).join(', ')));
  }
  const { number } = req.body;
  const existing = await Table.findOne({ number });
  if (existing) {
    res.status(409);
    return next(new Error('Table number already exists'));
  }
  const table = await Table.create({ number, qrId: createQrId() });
  res.status(201).json({ success: true, message: 'Table created', data: table });
};

export const removeTable = async (req, res, next) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    res.status(404);
    return next(new Error('Table not found'));
  }
  await table.remove();
  res.json({ success: true, message: 'Table removed' });
};

export const updateTableStatus = async (req, res, next) => {
  const table = await Table.findById(req.params.id);
  if (!table) {
    res.status(404);
    return next(new Error('Table not found'));
  }
  table.status = req.body.status || table.status;
  await table.save();
  res.json({ success: true, message: 'Table status updated', data: table });
};
