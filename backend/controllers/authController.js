import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Signs a JWT. The secret is REQUIRED (server.js refuses to start without
 * one) and the lifetime comes from JWT_EXPIRES_IN instead of being hardcoded.
 */
export const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

/** Safe user payload — never includes the password hash. */
export const toPublicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  hostel: user.hostel,
  room: user.room,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const normalizeEmail = (email) => String(email).trim().toLowerCase();

export const registerUser = async (req, res, next) => {
  try {
    const { name, password, hostel, room } = req.body;
    const email = normalizeEmail(req.body.email);

    const userExists = await User.findOne({ email });
    if (userExists) throw ApiError.conflict('User already exists');

    const user = await User.create({
      name: name.trim(),
      email,
      password,
      role: 'student', // Registration always forces student
      hostel,
      room,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: toPublicUser(user),
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { password } = req.body;
    const email = normalizeEmail(req.body.email);

    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: toPublicUser(user),
          token: generateToken(user._id),
        },
      });
    } else {
      throw new ApiError(401, 'Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) throw ApiError.notFound('User not found');

    res.json({ success: true, data: { user: toPublicUser(user) } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, hostel, room } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) throw ApiError.notFound('User not found');

    if (name !== undefined) user.name = String(name).trim();

    if (email !== undefined) {
      const normalized = normalizeEmail(email);
      const existing = await User.findOne({ email: normalized });
      if (existing && String(existing._id) !== String(user._id)) {
        throw ApiError.conflict('This email is already in use.');
      }
      user.email = normalized;
    }

    // Hostel / room are student fields — managers cannot change them here.
    if (user.role === 'student') {
      if (hostel !== undefined) user.hostel = hostel;
      if (room !== undefined) user.room = room;
    }

    // The pre-save hook skips hashing when the password was never loaded.
    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: toPublicUser(user) },
    });
  } catch (error) {
    next(error);
  }
};
