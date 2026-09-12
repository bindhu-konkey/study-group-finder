const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: [true, 'Group ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
      maxlength: 120,
    },
    date: {
      type: String,
      required: [true, 'Meeting date is required'],
      trim: true,
    },
    time: {
      type: String,
      required: [true, 'Meeting time is required'],
      trim: true,
    },
    startTime: {
      type: String,
      trim: true,
      default: function () {
        return this.time || '10:00 AM';
      },
    },
    endTime: {
      type: String,
      trim: true,
      default: '',
    },
    meetingType: {
      type: String,
      enum: ['online', 'offline'],
      default: function () {
        return this.meetingLink ? 'online' : 'offline';
      },
    },
    location: {
      type: String,
      trim: true,
      default: 'Library Room 204',
    },
    meetingLink: {
      type: String,
      trim: true,
      default: '',
    },
    agenda: {
      type: String,
      trim: true,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Meeting = mongoose.models.Meeting || mongoose.model('Meeting', meetingSchema);
if (!mongoose.models.StudySession) {
  try {
    mongoose.model('StudySession', meetingSchema);
  } catch (err) {}
}

module.exports = Meeting;
