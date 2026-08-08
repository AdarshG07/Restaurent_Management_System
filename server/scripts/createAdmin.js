import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import Admin from '../src/models/Admin.js';
import Category from '../src/models/Category.js';
import FoodItem from '../src/models/FoodItem.js';
import Table from '../src/models/Table.js';
dotenv.config();

const createAdmin = async () => {
  try {
    await connectDB();

    const email = 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      throw new Error('ADMIN_PASSWORD is not set in .env');
    }

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    await Admin.create({
      name: 'Restaurant Admin',
      email,
      password,
    });

    console.log('Admin created successfully');
    console.log('Email:', email);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();