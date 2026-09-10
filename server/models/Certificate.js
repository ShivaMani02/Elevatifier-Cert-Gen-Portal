const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  certificateId: {
    type: String,
    required: true,
    unique: true,
    index: true,
    uppercase: true,
    trim: true
  },
  studentName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  mobile: {
    type: String,
    required: true,
    trim: true
  },
  college: {
    type: String,
    required: true,
    trim: true
  },
  degree: {
    type: String,
    required: true,
    trim: true
  },
  domain: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: String,
    required: true,
    enum: ['3 Months', '6 Months', '9 Months']
  },
  startDate: {
    type: String,
    default: ''
  },
  endDate: {
    type: String,
    default: ''
  },
  issueDate: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    default: 399
  },
  currency: {
    type: String,
    default: 'INR'
  },
  razorpayOrderId: {
    type: String,
    required: true,
    index: true
  },
  razorpayPaymentId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['ISSUED', 'VERIFIED', 'REVOKED'],
    default: 'ISSUED'
  },
  isLocked: {
    type: Boolean,
    default: true
  },
  verificationUrl: {
    type: String,
    required: true
  },
  qrCodeDataUrl: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Immutability Guard: Prevent modifications to already issued/locked certificates
certificateSchema.pre(['updateOne', 'findOneAndUpdate', 'updateMany'], function(next) {
  const err = new Error('Elevatifier Security Guard: Issued certificates are cryptographically locked and immutable. Edits are forbidden.');
  next(err);
});

module.exports = mongoose.model('Certificate', certificateSchema);
