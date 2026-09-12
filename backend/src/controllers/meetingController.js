const mongoose = require('mongoose');
const Meeting = require('../models/Meeting');
const Group = require('../models/Group');
const Notification = require('../models/Notification');

// POST /api/groups/:id/meetings or /api/groups/:id/sessions
exports.createMeeting = async (req, res, next) => {
  try {
    const groupId = req.params.id;
    const userId = req.userId.toString();
    const { title, date, time, startTime, endTime, meetingType, location, meetingLink, agenda } = req.body;

    if (!title || !date) {
      return res.status(400).json({ error: 'Meeting title and date are required.' });
    }

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID format.' });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Study group not found.' });
    }

    const isMember = group.members.some((m) => (m._id || m).toString() === userId);
    const ownerId = (group.createdBy?._id || group.createdBy || group.creator?._id || group.creator)?.toString();

    if (!isMember && ownerId !== userId) {
      return res.status(403).json({ error: 'Only group members can schedule study sessions.' });
    }

    const displayTime = time || (startTime && endTime ? `${startTime} - ${endTime}` : startTime || '10:00 AM');
    const computedType = meetingType || (meetingLink ? 'online' : 'offline');

    const meeting = new Meeting({
      groupId: group._id,
      title: title.trim(),
      date: date.trim(),
      time: displayTime,
      startTime: startTime || displayTime,
      endTime: endTime || '',
      meetingType: computedType,
      location: location ? location.trim() : computedType === 'online' ? 'Google Meet / Zoom' : 'Library / Room 204',
      meetingLink: meetingLink ? meetingLink.trim() : '',
      agenda: agenda ? agenda.trim() : '',
      createdBy: userId,
    });

    await meeting.save();

    // Notify other group members
    try {
      const otherMembers = group.members.filter((m) => (m._id || m).toString() !== userId);
      const notifications = otherMembers.map((mId) => ({
        userId: mId,
        title: 'New Study Session Scheduled',
        message: `"${title}" was scheduled for ${group.title} on ${date}.`,
        type: 'new_meeting',
        link: `/groups/${group._id}`,
      }));
      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    } catch (notifErr) {}

    return res.status(201).json({
      message: 'Study session scheduled successfully!',
      meeting,
      session: meeting,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:id/meetings or /api/groups/:id/sessions
exports.getGroupMeetings = async (req, res, next) => {
  try {
    const groupId = req.params.id;

    if (!groupId || !mongoose.Types.ObjectId.isValid(groupId)) {
      return res.status(400).json({ error: 'Invalid group ID format.' });
    }

    const meetings = await Meeting.find({ groupId })
      .populate('createdBy', 'name email branch avatar')
      .sort({ date: 1, time: 1 });

    return res.json({ count: meetings.length, meetings, sessions: meetings });
  } catch (err) {
    next(err);
  }
};

// PUT /api/meetings/:id or /api/sessions/:id
exports.updateMeeting = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.userId.toString();
    const { title, date, time, startTime, endTime, meetingType, location, meetingLink, agenda } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid session ID.' });
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Study session not found.' });
    }

    const group = await Group.findById(meeting.groupId);
    const groupOwnerId = group
      ? (group.createdBy?._id || group.createdBy || group.creator?._id || group.creator)?.toString()
      : '';

    if (meeting.createdBy.toString() !== userId && groupOwnerId !== userId) {
      return res.status(403).json({ error: 'Access denied. You cannot update this study session.' });
    }

    if (title) meeting.title = title.trim();
    if (date) meeting.date = date.trim();
    if (time) meeting.time = time.trim();
    if (startTime) meeting.startTime = startTime.trim();
    if (endTime) meeting.endTime = endTime.trim();
    if (meetingType) meeting.meetingType = meetingType;
    if (location !== undefined) meeting.location = location.trim();
    if (meetingLink !== undefined) meeting.meetingLink = meetingLink.trim();
    if (agenda !== undefined) meeting.agenda = agenda.trim();

    await meeting.save();

    return res.json({ message: 'Study session updated successfully!', meeting, session: meeting });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/meetings/:id or /api/sessions/:id
exports.deleteMeeting = async (req, res, next) => {
  try {
    const id = req.params.id;
    const userId = req.userId.toString();

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid session ID.' });
    }

    const meeting = await Meeting.findById(id);
    if (!meeting) {
      return res.status(404).json({ error: 'Study session not found.' });
    }

    const group = await Group.findById(meeting.groupId);
    const groupOwnerId = group
      ? (group.createdBy?._id || group.createdBy || group.creator?._id || group.creator)?.toString()
      : '';

    if (meeting.createdBy.toString() !== userId && groupOwnerId !== userId) {
      return res.status(403).json({ error: 'Access denied. You cannot delete this study session.' });
    }

    await Meeting.findByIdAndDelete(meeting._id);
    return res.json({ message: 'Study session deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/sessions/my-sessions
exports.getMySessions = async (req, res, next) => {
  try {
    const userId = req.userId.toString();

    const myGroups = await Group.find({
      $or: [{ creator: userId }, { createdBy: userId }, { members: userId }],
    }).select('_id title subject branch semester');

    const groupIds = myGroups.map((g) => g._id);

    const meetings = await Meeting.find({ groupId: { $in: groupIds } })
      .populate('groupId', 'title subject branch semester')
      .populate('createdBy', 'name email branch avatar')
      .sort({ date: 1, time: 1 });

    return res.json({ sessions: meetings, meetings });
  } catch (err) {
    next(err);
  }
};
