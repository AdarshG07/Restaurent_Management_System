import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Admin from './models/Admin.js';

dotenv.config();

const resetAdmin = async () => {
  try {
    await connectDB();

    const admin = await Admin.findOne({ email: 'admin@example.com' });

    if (!admin) {
      console.log('Admin not found');
      process.exit(1);
    }

    admin.password = 'admin123';
    await admin.save();

    console.log('Admin password reset successfully');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('Reset error:', error.message);
    process.exit(1);
  }
};

resetAdmin();