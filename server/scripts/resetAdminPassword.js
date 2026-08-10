import dotenv from 'dotenv';
import connectDB from '../src/config/db.js';
import Admin from '../src/models/Admin.js';

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await connectDB();

    const email = 'admin@example.com';
    const password = process.env.ADMIN_PASSWORD;

    if (!password) {
      throw new Error('ADMIN_PASSWORD is not set in .env');
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      console.log('Admin not found');
      process.exit(1);
    }

    admin.password = password;
    await admin.save();

    console.log('Admin password updated successfully');
    console.log('Email:', email);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

resetAdminPassword();