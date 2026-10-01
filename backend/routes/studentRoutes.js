import express from 'express';
import User from '../models/User.js';
import Complaint from '../models/Complaint.js';
import { protect, authorizeManager } from '../middleware/auth.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';

const router = express.Router();

const emptyStats = () => ({ total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 });

// GET /api/students — list all students with complaint stats (manager only)
router.get('/', protect, authorizeManager, async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const filter = { role: 'student' };
    const total = pagination ? await User.countDocuments(filter) : undefined;

    const query = User.find(filter).select('-password').sort({ createdAt: -1 });
    if (pagination) query.skip(pagination.skip).limit(pagination.limit);
    const students = await query;

    // One aggregation gives every student's complaint counters.
    const statsRows = await Complaint.aggregate([
      { $match: { studentId: { $in: students.map((s) => s._id) } } },
      {
        $group: {
          _id: '$studentId',
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        },
      },
    ]);
    const statsById = new Map(statsRows.map((row) => [String(row._id), row]));

    const withStats = students.map((student) => {
      const { _id, ...rest } = student.toObject();
      const row = statsById.get(String(_id));
      const stats = row
        ? {
            total: row.total,
            pending: row.pending,
            inProgress: row.inProgress,
            resolved: row.resolved,
            rejected: row.rejected,
          }
        : emptyStats();
      return { _id, ...rest, stats };
    });

    res.json({
      success: true,
      data: {
        students: withStats,
        ...(pagination ? { pagination: buildPaginationMeta({ ...pagination, total }) } : {}),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/students/managers — list all manager accounts (manager only)
router.get('/managers', protect, authorizeManager, async (_req, res, next) => {
  try {
    const managers = await User.find({ role: 'manager' }).select('-password');
    res.json({ success: true, data: { managers } });
  } catch (error) {
    next(error);
  }
});

export default router;
