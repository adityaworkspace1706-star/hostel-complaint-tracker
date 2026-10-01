import express from 'express';
import Complaint from '../models/Complaint.js';
import User from '../models/User.js';
import { protect, authorizeManager } from '../middleware/auth.js';

const router = express.Router();

const toMap = (rows, key = '_id') =>
  rows.reduce((acc, row) => {
    acc[row[key]] = row.count;
    return acc;
  }, {});

const OVER_TIME_DAYS = 14;

/** Daily counts for the last 14 days (labels match the mock API). */
const buildOverTime = async () => {
  const dayStarts = [];
  for (let i = OVER_TIME_DAYS - 1; i >= 0; i -= 1) {
    const day = new Date();
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);
    dayStarts.push(day);
  }

  const rows = await Complaint.find({ createdAt: { $gte: dayStarts[0] } })
    .select('createdAt')
    .lean();

  const counts = dayStarts.map(() => 0);
  const windows = dayStarts.map((start, index) => ({
    from: start.getTime(),
    to: index + 1 < dayStarts.length ? dayStarts[index + 1].getTime() : start.getTime() + 86400000,
  }));

  rows.forEach((row) => {
    const time = new Date(row.createdAt).getTime();
    const index = windows.findIndex((w) => time >= w.from && time < w.to);
    if (index !== -1) counts[index] += 1;
  });

  return dayStarts.map((day, index) => ({
    date: day.toISOString().slice(0, 10),
    count: counts[index],
  }));
};

// GET /api/analytics — summary analytics for manager dashboard
router.get('/', protect, authorizeManager, async (_req, res, next) => {
  try {
    const [total, statusRows, priorityRows, categoryRows, issueRows, resolvedRows, totalStudents] =
      await Promise.all([
        Complaint.countDocuments(),
        Complaint.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Complaint.aggregate([{ $group: { _id: '$priority', count: { $sum: 1 } } }]),
        Complaint.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
        Complaint.aggregate([
          { $group: { _id: { issue: '$issue', category: '$category' }, count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Complaint.find({ status: 'resolved' }).select('createdAt resolvedAt').lean(),
        User.countDocuments({ role: 'student' }),
      ]);

    const [overTime, recentComplaints] = await Promise.all([
      buildOverTime(),
      Complaint.find()
        .populate('studentId', 'name hostel room')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);

    const resolved = resolvedRows.length;
    const resolutionTimes = resolvedRows
      .map((c) => (new Date(c.resolvedAt) - new Date(c.createdAt)) / 86400000)
      .filter((n) => Number.isFinite(n) && n >= 0);

    const analytics = {
      total,
      // Only observed keys (same as the mock API) — charts ignore the rest.
      byStatus: toMap(statusRows),
      byPriority: toMap(priorityRows),
      byCategory: toMap(categoryRows),
      byIssue: Object.fromEntries(
        issueRows
          .filter((r) => r._id?.issue)
          .map((r) => [`${r._id.issue} (${r._id.category})`, r.count])
      ),
      overTime,
      resolution: {
        resolved,
        rejected: toMap(statusRows).rejected ?? 0,
        resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
        avgResolutionDays: resolutionTimes.length
          ? Number(
              (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(1)
            )
          : 0,
      },
      totalStudents,
      recentComplaints,
    };

    res.json({ success: true, data: { analytics } });
  } catch (error) {
    next(error);
  }
});

export default router;
