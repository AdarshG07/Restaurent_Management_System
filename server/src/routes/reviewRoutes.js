import express from 'express';
import { body } from 'express-validator';
import { createReview, listReviews } from '../controllers/reviewController.js';

const router = express.Router();

router.post(
  '/',
  [
    body('orderId').notEmpty().withMessage('Order ID is required'),
    body('foodRating').isInt({ min: 1, max: 5 }).withMessage('Food rating must be 1 to 5'),
    body('serviceRating').isInt({ min: 1, max: 5 }).withMessage('Service rating must be 1 to 5'),
  ],
  createReview
);
router.get('/', listReviews);

export default router;
