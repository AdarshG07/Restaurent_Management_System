import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import Admin from '../models/Admin.js';

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

export const loginAdmin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422);
    return next(new Error(errors.array().map((e) => e.msg).join(', ')));
  }
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email });
  if (admin && (await admin.matchPassword(password))) {
    return res.json({
      success: true,
      message: 'Login successful',
      data: {
        token: createToken(admin._id),
        admin: { id: admin._id, name: admin.name, email: admin.email },
      },
    });
  }
  res.status(401);
  next(new Error('Invalid email or password'));
};

export const getAdminProfile = async (req, res, next) => {
  if (!req.admin) {
    res.status(401);
    return next(new Error('Not authorized'));
  }
  res.json({ success: true, message: 'Profile fetched', data: req.admin });
};
