import Complaint from '../models/Complaint.js';
import { ApiError } from '../middleware/errorHandler.js';
import { getPriorityForIssue } from '../constants/complaints.js';
import { nextComplaintIdFromMax } from '../utils/complaintId.js';
import { buildPaginationMeta, parsePagination } from '../utils/pagination.js';
import { validateComplaintUpdateData } from '../utils/validation.js';
import { validateFeedback, validateReopen } from '../utils/complaintActions.js';

const POPULATE_STUDENT = 'name email hostel room';

/**
 * Response shape for a complaint: the real API returns a populated
 * `studentId` object AND a denormalized `studentName` for display, matching
 * what the frontend (and the mock API) expect.
 */
const serialize = (doc) => {
  const complaint = typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
  const student = complaint.studentId;
  if (student && typeof student === 'object' && student.name) {
    complaint.studentName = student.name;
  }
  return complaint;
};

/**
 * Next free complaint ID based on the highest suffix ever used — deleting a
 * complaint cannot hand out a duplicate ID. Retries on the (rare) concurrent
 * create race, which the unique index turns into an E11000 error.
 */
const generateComplaintId = async () => {
  const [row] = await Complaint.aggregate([
    { $match: { complaintId: /^CMP-\d+$/ } },
    {
      $group: {
        _id: null,
        max: { $max: { $toInt: { $substrCP: ['$complaintId', 4, 32] } } },
      },
    },
  ]);
  return nextComplaintIdFromMax(row?.max);
};

const createWithUniqueComplaintId = async (fields) => {
  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const complaintId = await generateComplaintId();
    try {
      return await Complaint.create({ ...fields, complaintId });
    } catch (error) {
      if (error?.code !== 11000 || attempt === 5) throw error;
      // Someone else claimed this ID between generate and create — retry.
    }
  }
  throw ApiError.badRequest('Could not allocate a complaint ID');
};

const listResponse = (complaints, pagination, total) =>
  pagination
    ? { complaints, pagination: buildPaginationMeta({ ...pagination, total }) }
    : { complaints };

const ownerOf = (complaint) => complaint.studentId?._id ?? complaint.studentId;

export const createComplaint = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      throw ApiError.forbidden('Only students can file complaints');
    }

    const { category, issue, description, hostel, room, images } = req.body;

    // Priority is derived server-side from the category + issue mapping —
    // any `priority` sent by the client is deliberately ignored.
    const complaint = await createWithUniqueComplaintId({
      studentId: req.user._id,
      category,
      issue,
      description: description.trim(),
      hostel,
      room,
      images: Array.isArray(images) ? images : [],
      priority: getPriorityForIssue(category, issue),
      status: 'pending',
    });

    await complaint.populate('studentId', POPULATE_STUDENT);
    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: { complaint: serialize(complaint) },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyComplaints = async (req, res, next) => {
  try {
    const filter = { studentId: req.user._id };
    const pagination = parsePagination(req.query);
    const total = pagination ? await Complaint.countDocuments(filter) : undefined;

    const query = Complaint.find(filter)
      .populate('studentId', POPULATE_STUDENT)
      .sort({ createdAt: -1 });
    if (pagination) query.skip(pagination.skip).limit(pagination.limit);

    const complaints = await query;
    res.json({ success: true, data: listResponse(complaints.map(serialize), pagination, total) });
  } catch (error) {
    next(error);
  }
};

export const getAllComplaints = async (req, res, next) => {
  try {
    const pagination = parsePagination(req.query);
    const total = pagination ? await Complaint.countDocuments() : undefined;

    const query = Complaint.find()
      .populate('studentId', POPULATE_STUDENT)
      .sort({ createdAt: -1 });
    if (pagination) query.skip(pagination.skip).limit(pagination.limit);

    const complaints = await query;
    res.json({ success: true, data: listResponse(complaints.map(serialize), pagination, total) });
  } catch (error) {
    next(error);
  }
};

export const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      'studentId',
      POPULATE_STUDENT
    );
    if (!complaint) throw ApiError.notFound('Complaint not found');

    // Students can only view their own complaints
    if (req.user.role !== 'manager' && String(ownerOf(complaint)) !== String(req.user._id)) {
      throw ApiError.forbidden('Not authorized');
    }

    res.json({ success: true, data: { complaint: serialize(complaint) } });
  } catch (error) {
    next(error);
  }
};

export const updateComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw ApiError.notFound('Complaint not found');

    const validationError = validateComplaintUpdateData(req.body, {
      role: req.user.role,
      existing: complaint,
    });
    if (validationError) throw ApiError.badRequest(validationError);

    if (req.user.role === 'manager') {
      const { status, priority, managerComment, assignedTo } = req.body;
      if (status !== undefined) {
        complaint.status = status;
        if (status === 'resolved') {
          // Record the resolution time once; reopening below clears it.
          if (!complaint.resolvedAt) complaint.resolvedAt = new Date();
        } else {
          // Reopened (or rejected / back in progress): clear the stale
          // resolution timestamp so it never shows for a live complaint.
          complaint.resolvedAt = null;
        }
      }
      if (priority !== undefined) complaint.priority = priority;
      if (managerComment !== undefined) complaint.managerComment = managerComment;
      if (assignedTo !== undefined) complaint.assignedTo = assignedTo;
    } else {
      // Students can only edit their own pending complaints — content only;
      // priority stays auto-derived and status is manager-controlled.
      if (String(ownerOf(complaint)) !== String(req.user._id)) {
        throw ApiError.forbidden('Not authorized');
      }
      if (complaint.status !== 'pending') {
        throw ApiError.badRequest('Only pending complaints can be edited');
      }

      const { category, issue, description, hostel, room } = req.body;
      if (category !== undefined) complaint.category = category;
      if (issue !== undefined) complaint.issue = issue;
      if (description !== undefined) complaint.description = description.trim();
      if (hostel !== undefined) complaint.hostel = hostel;
      if (room !== undefined) complaint.room = room;
      if (category !== undefined || issue !== undefined) {
        complaint.priority = getPriorityForIssue(complaint.category, complaint.issue);
      }
    }

    const updated = await complaint.save();
    await updated.populate('studentId', POPULATE_STUDENT);
    res.json({
      success: true,
      message: 'Complaint updated',
      data: { complaint: serialize(updated) },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteComplaint = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw ApiError.notFound('Complaint not found');

    // Only the owner (student, own pending complaints) or a manager can delete
    if (req.user.role !== 'manager') {
      if (String(ownerOf(complaint)) !== String(req.user._id)) {
        throw ApiError.forbidden('Not authorized');
      }
      if (complaint.status !== 'pending') {
        throw ApiError.badRequest('Only pending complaints can be deleted');
      }
    }

    await complaint.deleteOne();
    res.json({ success: true, message: 'Complaint deleted', data: {} });
  } catch (error) {
    next(error);
  }
};

/** Only the complaint owner may review or reopen a resolved complaint. */
const findOwnedResolved = async (req) => {
  if (req.user.role !== 'student') throw ApiError.forbidden('Students only');
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) throw ApiError.notFound('Complaint not found');
  if (String(ownerOf(complaint)) !== String(req.user._id)) throw ApiError.forbidden('Not authorized');
  if (complaint.status !== 'resolved') throw ApiError.badRequest('Complaint must be resolved');
  return complaint;
};

export const submitFeedback = async (req, res, next) => {
  try {
    const { rating, comment = '' } = req.body ?? {};
    const validationError = validateFeedback({ rating, comment });
    if (validationError) throw ApiError.badRequest(validationError);
    const complaint = await findOwnedResolved(req);
    if (complaint.feedbackRating != null) throw ApiError.badRequest('Feedback already submitted');
    complaint.feedbackRating = rating;
    complaint.feedbackComment = comment.trim();
    await complaint.save();
    await complaint.populate('studentId', POPULATE_STUDENT);
    res.json({ success: true, data: { complaint: serialize(complaint) } });
  } catch (error) { next(error); }
};

export const reopenComplaint = async (req, res, next) => {
  try {
    const { reason } = req.body ?? {};
    const validationError = validateReopen({ reason });
    if (validationError) throw ApiError.badRequest(validationError);
    const complaint = await findOwnedResolved(req);
    complaint.status = 'pending';
    complaint.resolvedAt = null;
    complaint.reopenedAt = new Date();
    complaint.reopenReason = reason.trim();
    // Clear feedback for the new resolution cycle.
    complaint.feedbackRating = null;
    complaint.feedbackComment = '';
    await complaint.save();
    await complaint.populate('studentId', POPULATE_STUDENT);
    res.json({ success: true, data: { complaint: serialize(complaint) } });
  } catch (error) { next(error); }
};
