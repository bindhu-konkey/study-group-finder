const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Group title is required'],
      trim: true,
      maxlength: 120,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 1000,
    },
    memberLimit: {
      type: Number,
      min: [2, 'Member limit must be at least 2'],
      max: [50, 'Member limit cannot exceed 50'],
      default: 5,
    },
    maxMembers: {
      type: Number,
      min: [2, 'Member limit must be at least 2'],
      max: [50, 'Member limit cannot exceed 50'],
      default: 5,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    branch: {
      type: String,
      trim: true,
      default: 'General',
      index: true,
    },
    semester: {
      type: String,
      trim: true,
      default: 'All Semesters',
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for remaining seats
groupSchema.virtual('seatsLeft').get(function () {
  const currentMembers = Array.isArray(this.members) ? this.members.length : 0;
  const limit = this.maxMembers || this.memberLimit || 5;
  return Math.max(0, limit - currentMembers);
});

// Virtual for isFull
groupSchema.virtual('isFull').get(function () {
  const currentMembers = Array.isArray(this.members) ? this.members.length : 0;
  const limit = this.maxMembers || this.memberLimit || 5;
  return currentMembers >= limit;
});

// Ensure creator and createdBy, maxMembers and memberLimit are kept in sync
groupSchema.pre('validate', function (next) {
  if (this.createdBy && !this.creator) {
    this.creator = this.createdBy;
  } else if (this.creator && !this.createdBy) {
    this.createdBy = this.creator;
  }
  if (this.maxMembers && !this.memberLimit) {
    this.memberLimit = this.maxMembers;
  } else if (this.memberLimit && !this.maxMembers) {
    this.maxMembers = this.memberLimit;
  }
  if (typeof next === 'function') next();
});

// Index for search queries
groupSchema.index({ title: 'text', subject: 'text', description: 'text' });

const Group = mongoose.models.Group || mongoose.model('Group', groupSchema);
if (!mongoose.models.StudyGroup) {
  try {
    mongoose.model('StudyGroup', groupSchema);
  } catch (err) {}
}

module.exports = Group;
