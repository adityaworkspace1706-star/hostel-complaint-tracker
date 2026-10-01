import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  let decoded;
  try {
    // No fallback secret: JWT_SECRET is required to boot (see server.js).
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }

  try {
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized, account no longer exists' });
    }
    req.user = user;
    return next();
  } catch (error) {
    // Infrastructure failures (e.g. DB down) go to the centralized handler.
    return next(error);
  }
};

export const authorizeManager = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access restricted to managers only' });
  }
};
