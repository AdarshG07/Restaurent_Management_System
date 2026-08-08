import express from 'express';
import { body } from 'express-validator';
import { createPaymentOrder, getPaymentStatus, verifyPayment } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create', [body('orderId').notEmpty().withMessage('Order ID is required')], createPaymentOrder);
router.post(
  '/verify',
  [
    body('orderId').notEmpty(),
    body('razorpayPaymentId').notEmpty(),
    body('razorpayOrderId').notEmpty(),
    body('razorpaySignature').notEmpty(),
  ],
  verifyPayment
);
router.get('/:orderId', getPaymentStatus);

export default router;
