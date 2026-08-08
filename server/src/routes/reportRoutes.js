import express from 'express';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { getReports } from '../controllers/reportController.js';

const router = express.Router();

router.get('/', protectAdmin, getReports);

export default router;
