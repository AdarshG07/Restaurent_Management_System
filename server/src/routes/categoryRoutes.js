import express from 'express';
import { body } from 'express-validator';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { createCategory, deleteCategory, listCategories, updateCategory } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', listCategories);
router.post('/', protectAdmin, [body('name').notEmpty().withMessage('Category name is required')], createCategory);
router.put('/:id', protectAdmin, updateCategory);
router.delete('/:id', protectAdmin, deleteCategory);

export default router;
