import { validationResult } from 'express-validator';
import FoodItem from '../models/FoodItem.js';
import Category from '../models/Category.js';
import { emitNotification } from '../sockets/socketHandler.js';
import { LOW_STOCK_THRESHOLD } from '../config/constants.js';

export const listFoodItems = async (req, res, next) => {
  const { search, category, sortBy, availability, special, recommended, isVeg } = req.query;
  const filter = {};
  if (search) filter.name = { $regex: search, $options: 'i' };
  if (category) filter.category = category;
  if (availability === 'available') filter.isAvailable = true;
  if (special === 'true') filter.isSpecial = true;
  if (recommended === 'true') filter.isRecommended = true;
  if (isVeg === 'true') filter.isVeg = true;
  if (isVeg === 'false') filter.isVeg = false;

  let query = FoodItem.find(filter).populate('category', 'name');
  if (sortBy === 'priceAsc') query = query.sort({ price: 1 });
  if (sortBy === 'priceDesc') query = query.sort({ price: -1 });
  if (sortBy === 'popularity') query = query.sort({ popularity: -1 });

  const items = await query;
  res.json({ success: true, message: 'Menu loaded', data: items });
};

export const getFoodItem = async (req, res, next) => {
  const item = await FoodItem.findById(req.params.id).populate('category', 'name');
  if (!item) {
    res.status(404);
    return next(new Error('Food item not found'));
  }
  res.json({ success: true, message: 'Food item loaded', data: item });
};

export const createFoodItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    return next(new Error(errors.array().map((e) => e.msg).join(', ')));
  }
  const { name, description, ingredients, price, image, category, preparationTime, spiceLevel, rating, isVeg, isAvailable, stockQuantity, isSpecial, isRecommended } = req.body;
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(404);
    return next(new Error('Category not found'));
  }
  const payload = {
    name,
    description,
    ingredients,
    price,
    image,
    category,
    preparationTime,
    spiceLevel,
    rating,
    isVeg,
    isAvailable,
    isSpecial,
    isRecommended,
  };
  const parsedStock = stockQuantity !== undefined && stockQuantity !== '' ? Number(stockQuantity) : undefined;
  if (parsedStock !== undefined) {
    payload.stockQuantity = parsedStock;
    if (parsedStock === 0) {
      payload.isAvailable = false;
    }
  }
  const food = await FoodItem.create(payload);
  res.status(201).json({ success: true, message: 'Food item added', data: food });
};

export const updateFoodItem = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    return next(new Error(errors.array().map((e) => e.msg).join(', ')));
  }

  const item = await FoodItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    return next(new Error('Food item not found'));
  }
  const oldStockQuantity = item.stockQuantity;
  const fields = ['name', 'description', 'ingredients', 'price', 'image', 'category', 'preparationTime', 'spiceLevel', 'rating', 'isVeg', 'isAvailable', 'isSpecial', 'isRecommended'];
  fields.forEach((field) => {
    if (req.body[field] !== undefined) item[field] = req.body[field];
  });

  const stockQuantityField = req.body.stockQuantity;
  const stockQuantityProvided = stockQuantityField !== undefined && stockQuantityField !== '';
  if (stockQuantityProvided) {
    item.stockQuantity = Number(stockQuantityField);
    if (item.stockQuantity === 0) {
      item.isAvailable = false;
    }
  }

  await item.save();

  const newStockQuantity = item.stockQuantity;
  const stockChanged = stockQuantityProvided && Number(stockQuantityField) !== oldStockQuantity;
  const isNowLowStock = typeof newStockQuantity === 'number' && newStockQuantity > 0 && newStockQuantity <= LOW_STOCK_THRESHOLD;
  if (stockChanged && isNowLowStock) {
    emitNotification({
      title: 'Low Stock',
      message: `${item.name} has only ${newStockQuantity} items remaining.`,
      type: 'low-stock',
    });
  }

  res.json({ success: true, message: 'Food item updated', data: item });
};

export const deleteFoodItem = async (req, res, next) => {
  const item = await FoodItem.findById(req.params.id);
  if (!item) {
    res.status(404);
    return next(new Error('Food item not found'));
  }
  await item.remove();
  res.json({ success: true, message: 'Food item deleted' });
};
