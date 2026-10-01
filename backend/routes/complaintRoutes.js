import express from 'express';
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} from '../controllers/complaintController.js';
import { protect, authorizeManager } from '../middleware/auth.js';
import { validateComplaintCreate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', protect, validateComplaintCreate, createComplaint);
router.get('/my', protect, getMyComplaints);
router.get('/all', protect, authorizeManager, getAllComplaints);
router.get('/:id', protect, getComplaintById);
// Update validation is role-aware and needs the existing document, so it runs
// inside the controller (validateComplaintUpdateData).
router.put('/:id', protect, updateComplaint);
router.delete('/:id', protect, deleteComplaint);

export default router;
