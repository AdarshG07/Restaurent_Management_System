import { validationResult } from 'express-validator';
import Category from '../models/Category.js';
import FoodItem from '../models/FoodItem.js';

export const listCategories = async (req, res, next) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json({ success: true, message: 'Categories loaded', data: categories });
};

export const createCategory = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    return next(new Error(errors.array().map((e) => e.msg).join(', ')));
  }

  const name = req.body.name?.trim();
  const description = req.body.description?.trim() || '';

  if (!name) {
    res.status(400);
    return next(new Error('Category name is required'));
  }

  const existing = await Category.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
  if (existing) {
    res.status(409);
    return next(new Error('Category already exists'));
  }

  const category = await Category.create({ name, description });
  res.status(201).json({ success: true, message: 'Category created', data: category });
};

export const updateCategory = async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    return next(new Error('Category not found'));
  }

  const name = req.body.name?.trim();
  if (!name) {
    res.status(400);
    return next(new Error('Category name is required'));
  }

  const existing = await Category.findOne({ _id: { $ne: category._id }, name: { $regex: `^${name}$`, $options: 'i' } });
  if (existing) {
    res.status(409);
    return next(new Error('Category already exists'));
  }

  category.name = name;
  category.description = req.body.description?.trim() ?? category.description;
  await category.save();
  res.json({ success: true, message: 'Category updated', data: category });
};

export const deleteCategory = async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    return next(new Error('Category not found'));
  }

  const linkedItems = await FoodItem.countDocuments({ category: category._id });
  if (linkedItems > 0) {
    res.status(409);
    return next(new Error('Cannot delete category because food items still use it'));
  }

  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted' });
};
