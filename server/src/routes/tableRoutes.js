import express from 'express';
import { body } from 'express-validator';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { createTable, listTables, removeTable, updateTableStatus } from '../controllers/tableController.js';

const router = express.Router();

router.get('/', protectAdmin, listTables);
router.post('/', protectAdmin, [body('number').notEmpty().withMessage('Table number is required')], createTable);
router.delete('/:id', protectAdmin, removeTable);
router.patch('/:id/status', protectAdmin, updateTableStatus);

export default router;
