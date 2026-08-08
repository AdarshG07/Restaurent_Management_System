import express from 'express';
import { body } from 'express-validator';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { createManualOrder, createOrder, getOrder, listOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

router.get('/', protectAdmin, listOrders);
router.get('/:id', getOrder);
router.post(
  '/',
  [
    body('tableNumber').notEmpty().withMessage('Table number is required'),
    body('items').isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.foodId').notEmpty().withMessage('Each item must have a foodId'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  ],
  createOrder
);
router.post('/manual', protectAdmin, createManualOrder);
router.patch('/:id/status', protectAdmin, updateOrderStatus);

export default router;
