import express from 'express';
import { body } from 'express-validator';
import { loginAdmin, getAdminProfile } from '../controllers/authController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty().withMessage('Password is required')],
  loginAdmin
);
router.get('/profile', protectAdmin, getAdminProfile);

export default router;
