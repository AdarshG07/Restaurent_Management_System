import express from 'express';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { listNotifications, markRead } from '../controllers/notificationController.js';

const router = express.Router();

router.get('/', protectAdmin, listNotifications);
router.patch('/:id/read', protectAdmin, markRead);

export default router;
