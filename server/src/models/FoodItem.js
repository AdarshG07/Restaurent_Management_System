import mongoose from 'mongoose';

const foodItemSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    ingredients: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    preparationTime: { type: Number, default: 15 },
    spiceLevel: { type: String, enum: ['Mild', 'Medium', 'Spicy'], default: 'Medium' },
    rating: { type: Number, default: 4.5, min: 0, max: 5 },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    stockQuantity: {
      type: Number,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Stock quantity must be an integer',
      },
    },
    isSpecial: { type: Boolean, default: false },
    isRecommended: { type: Boolean, default: false },
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const FoodItem = mongoose.model('FoodItem', foodItemSchema);
export default FoodItem;
