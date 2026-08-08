import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Admin from '../models/Admin.js';
import Category from '../models/Category.js';
import FoodItem from '../models/FoodItem.js';
import Table from '../models/Table.js';

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    await Admin.deleteMany();
    await Category.deleteMany();
    await FoodItem.deleteMany();
    await Table.deleteMany();

    const seedPassword = process.env.SEED_ADMIN_PASSWORD || Math.random().toString(36).slice(-12);
    const admin = await Admin.create({
      name: 'Restaurant Admin',
      email: 'admin@example.com',
      password: seedPassword,
    });
    console.log('Seed admin password:', seedPassword);

    const categories = await Category.insertMany([
      { name: 'Starters', description: 'Tasty appetizers to begin your meal' },
      { name: 'Main Course', description: 'Hearty and flavourful main dishes' },
      { name: 'Desserts', description: 'Sweet treats to finish your meal' },
      { name: 'Beverages', description: 'Refreshing drinks and mocktails' },
    ]);

    const categoryMap = categories.reduce((acc, category) => {
      acc[category.name] = category._id;
      return acc;
    }, {});

    await FoodItem.insertMany([
      {
        name: 'Paneer Tikka',
        description: 'Grilled cottage cheese marinated in spices',
        ingredients: 'Paneer, yogurt, spices, bell pepper',
        price: 260,
        image: '/images/paneer.webp',
        category: categoryMap['Starters'],
        preparationTime: 15,
        spiceLevel: 'Medium',
        rating: 4.7,
        isVeg: true,
        isAvailable: true,
        isSpecial: true,
        isRecommended: true,
      },
      {
        name: 'Chicken Biryani',
        description: 'Aromatic chicken biryani cooked with basmati rice',
        ingredients: 'Chicken, rice, spices, saffron',
        price: 340,
        image: '/images/chicken.webp',
        category: categoryMap['Main Course'],
        preparationTime: 30,
        spiceLevel: 'Spicy',
        rating: 4.8,
        isVeg: false,
        isAvailable: true,
        isSpecial: true,
        isRecommended: true,
      },
      {
        name: 'Masala Dosa',
        description: 'Crispy rice pancake served with chutney and sambar',
        ingredients: 'Rice, lentils, potato, spices',
        price: 180,
        image: '/images/dosa.webp',
        category: categoryMap['Main Course'],
        preparationTime: 20,
        spiceLevel: 'Mild',
        rating: 4.6,
        isVeg: true,
        isAvailable: true,
        isSpecial: false,
        isRecommended: true,
      },
      {
        name: 'Chocolate Brownie',
        description: 'Warm brownie topped with vanilla ice cream',
        ingredients: 'Chocolate, butter, sugar, eggs',
        price: 160,
        image: '/images/brownie.webp',
        category: categoryMap['Desserts'],
        preparationTime: 10,
        spiceLevel: 'Mild',
        rating: 4.9,
        isVeg: true,
        isAvailable: true,
        isSpecial: false,
        isRecommended: true,
      },
      {
        name: 'Mango Lassi',
        description: 'Sweet mango yogurt drink',
        ingredients: 'Mango, yogurt, sugar',
        price: 120,
        image: '/images/mango.webp',
        category: categoryMap['Beverages'],
        preparationTime: 5,
        spiceLevel: 'Mild',
        rating: 4.5,
        isVeg: true,
        isAvailable: true,
        isSpecial: false,
        isRecommended: false,
      },
    ]);

    const tables = [1, 2, 3, 4, 5].map((n) => ({ number: String(n), qrId: `qr-table-${n}` }));
    await Table.insertMany(tables);

    console.log('Seed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
