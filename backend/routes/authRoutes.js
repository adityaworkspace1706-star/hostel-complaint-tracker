import express from 'express';
import { registerUser, loginUser, getMe, updateProfile } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { validateLogin, validateProfile, validateRegister } from '../middleware/validate.js';

const router = express.Router();

// Rate limited + validated: brute-force protection on credential endpoints.
router.post('/register', authLimiter, validateRegister, registerUser);
router.post('/login', authLimiter, validateLogin, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, validateProfile, updateProfile);

export default router;
