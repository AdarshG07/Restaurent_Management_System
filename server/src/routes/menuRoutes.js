import express from 'express';
import { body } from 'express-validator';
import { protectAdmin } from '../middleware/authMiddleware.js';
import {
  createFoodItem,
  deleteFoodItem,
  getFoodItem,
  listFoodItems,
  updateFoodItem,
} from '../controllers/foodController.js';

const router = express.Router();

router.get('/', listFoodItems);
router.get('/:id', getFoodItem);

router.post(
  '/',
  protectAdmin,
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a valid number'),
    body('category').notEmpty().withMessage('Category is required'),
    body('stockQuantity')
      .optional({ checkFalsy: true })
      .isInt({ min: 0 })
      .withMessage('Stock quantity must be a non-negative integer'),
  ],
  createFoodItem
);

router.put(
  '/:id',
  protectAdmin,
  [
    body('stockQuantity')
      .optional({ checkFalsy: true })
      .isInt({ min: 0 })
      .withMessage('Stock quantity must be a non-negative integer'),
  ],
  updateFoodItem
);

router.delete('/:id', protectAdmin, deleteFoodItem);

export default router;