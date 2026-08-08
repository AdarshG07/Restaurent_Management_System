import express from 'express';
import { body } from 'express-validator';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { createCustomBill, getCustomBill, listCustomBills } from '../controllers/billingController.js';

const router = express.Router();

router.post(
  '/',
  protectAdmin,
  [
    body('items').isArray({ min: 1 }).withMessage('At least one bill item is required'),
    body('items.*.name').notEmpty().withMessage('Item name is required'),
    body('items.*.price').isFloat({ min: 0 }).withMessage('Item price is required'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity is required'),
  ],
  createCustomBill
);
router.get('/', protectAdmin, listCustomBills);
router.get('/:id', protectAdmin, getCustomBill);

export default router;
