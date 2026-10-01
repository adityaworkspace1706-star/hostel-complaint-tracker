import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
    },
    issue: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    hostel: {
      type: String,
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'rejected'],
      default: 'pending',
    },
    managerComment: {
      type: String,
      default: '',
    },
    assignedTo: {
      type: String,
      default: '',
    },
    images: {
      type: [String],
      default: [],
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const Complaint = mongoose.model('Complaint', complaintSchema);
export default Complaint;
