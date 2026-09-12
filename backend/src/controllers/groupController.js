const mongoose = require('mongoose');
const Group = require('../models/Group');
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');

// GET /api/groups
exports.getAllGroups = async (req, res, next) => {
  try {
    const groups = await Group.find()
      .populate('creator', 'name email branch semester bio avatar')
      .populate('createdBy', 'name email branch semester bio avatar')
      .populate('members', 'name email branch semester bio avatar')
      .sort({ createdAt: -1 });

    return res.json({ count: groups.length, groups });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/my-groups
exports.getMyGroups = async (req, res, next) => {
  try {
    const userId = req.userId.toString();

    const createdGroups = await Group.find({
      $or: [{ creator: userId }, { createdBy: userId }],
    })
      .populate('creator', 'name email branch semester bio avatar')
      .populate('createdBy', 'name email branch semester bio avatar')
      .populate('members', 'name email branch semester bio avatar')
      .sort({ createdAt: -1 });

    const joinedGroups = await Group.find({
      creator: { $ne: userId },
      createdBy: { $ne: userId },
      members: userId,
    })
      .populate('creator', 'name email branch semester bio avatar')
      .populate('createdBy', 'name email branch semester bio avatar')
      .populate('members', 'name email branch semester bio avatar')
      .sort({ createdAt: -1 });

    return res.json({
      createdCount: createdGroups.length,
      joinedCount: joinedGroups.length,
      createdGroups,
      joinedGroups,
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/groups/:id
exports.getGroupById = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid group ID format.' });
    }

    const group = await Group.findById(id)
      .populate('creator', 'name email branch semester bio avatar')
      .populate('createdBy', 'name email branch semester bio avatar')
      .populate('members', 'name email branch semester bio avatar');

    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    const meetings = await Meeting.find({ groupId: group._id }).sort({ date: 1, time: 1 });

    return res.json({ group, meetings, sessions: meetings });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups
exports.createGroup = async (req, res, next) => {
  try {
    const { title, subject, description, memberLimit, maxMembers, branch, semester, tags } = req.body;

    if (!title || !subject || !description) {
      return res.status(400).json({ error: 'Group title, subject, and description are required.' });
    }

    const limit = parseInt(maxMembers || memberLimit, 10) || 5;
    if (limit < 2) {
      return res.status(400).json({ error: 'Member limit must be at least 2.' });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : typeof tags === 'string'
      ? tags.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const userId = req.userId.toString();

    const group = new Group({
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      memberLimit: limit,
      maxMembers: limit,
      creator: userId,
      createdBy: userId,
      members: [userId],
      branch: branch ? branch.trim() : req.user?.branch || 'General',
      semester: semester ? semester.trim() : req.user?.semester || 'All Semesters',
      tags: parsedTags,
    });

    await group.save();

    const populatedGroup = await Group.findById(group._id)
      .populate('creator', 'name email branch semester bio avatar')
      .populate('createdBy', 'name email branch semester bio avatar')
      .populate('members', 'name email branch semester bio avatar');

    return res.status(201).json({
      message: 'Study group created successfully!',
      group: populatedGroup,
    });
  } catch (err) {
    next(err);
  }
};

// PUT /api/groups/:id
exports.updateGroup = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid group ID format.' });
    }

    const userId = req.userId.toString();
    const { title, subject, description, memberLimit, maxMembers, branch, semester, tags } = req.body;

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    const ownerId = (group.createdBy?._id || group.createdBy || group.creator?._id || group.creator)?.toString();
    if (ownerId !== userId) {
      return res.status(403).json({ error: 'Access denied. Only the group creator can edit this group.' });
    }

    const newLimit = parseInt(maxMembers || memberLimit, 10);
    if (newLimit) {
      if (newLimit < 2) return res.status(400).json({ error: 'Member limit must be at least 2.' });
      if (newLimit < group.members.length) {
        return res.status(400).json({
          error: `Cannot reduce member limit to ${newLimit}. Current member count is already ${group.members.length}.`,
        });
      }
      group.memberLimit = newLimit;
      group.maxMembers = newLimit;
    }

    if (title) group.title = title.trim();
    if (subject) group.subject = subject.trim();
    if (description) group.description = description.trim();
    if (branch) group.branch = branch.trim();
    if (semester) group.semester = semester.trim();
    if (tags !== undefined) {
      group.tags = Array.isArray(tags) ? tags : tags.split(',').map((t) => t.trim()).filter(Boolean);
    }

    await group.save();

    const updated = await Group.findById(group._id)
      .populate('creator', 'name email branch semester bio avatar')
      .populate('createdBy', 'name email branch semester bio avatar')
      .populate('members', 'name email branch semester bio avatar');

    return res.json({ message: 'Study group updated successfully!', group: updated });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/groups/:id — PRODUCTION BUG FIX IMPLEMENTATION
exports.deleteGroup = async (req, res, next) => {
  try {
    const id = req.params.id;

    // 1. Validate ObjectId format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid group ID format.' });
    }

    // 2. Identify authenticated user
    const userId = req.userId ? req.userId.toString() : '';
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    // 3. Find group in MongoDB
    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    // 4. Verify ownership
    const ownerId = (group.createdBy?._id || group.createdBy || group.creator?._id || group.creator)?.toString();
    if (ownerId !== userId) {
      return res.status(403).json({ error: "You don't have permission to delete this group." });
    }

    // 5. Cascading cleanup of related sessions and notifications
    await Meeting.deleteMany({ groupId: group._id });
    try {
      await Notification.deleteMany({
        $or: [
          { link: `/groups/${group._id}` },
          { link: { $regex: group._id.toString() } },
        ],
      });
    } catch (cleanErr) {
      // Non-fatal
    }

    // 6. Delete group permanently from MongoDB
    await Group.findByIdAndDelete(group._id);

    // 7. Return clean success response
    return res.json({ message: 'Group deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/join
exports.joinGroup = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid group ID format.' });
    }

    const userId = req.userId.toString();

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    const isMember = group.members.some((m) => (m._id || m).toString() === userId);
    if (isMember) {
      return res.status(400).json({ error: 'You are already a member of this study group.' });
    }

    const limit = group.maxMembers || group.memberLimit || 5;
    if (group.members.length >= limit) {
      return res.status(400).json({
        error: `Capacity reached! This study group is full (${limit} / ${limit} Members).`,
      });
    }

    group.members.push(userId);
    await group.save();

    // Create notification for group creator if different user
    const ownerId = (group.createdBy?._id || group.createdBy || group.creator?._id || group.creator)?.toString();
    if (ownerId && ownerId !== userId) {
      try {
        await Notification.create({
          userId: ownerId,
          title: 'New Member Enrolled',
          message: `${req.user?.name || 'A student'} joined your study group: ${group.title}.`,
          type: 'group_join',
          link: `/groups/${group._id}`,
        });
      } catch (notifErr) {}
    }

    const updated = await Group.findById(group._id)
      .populate('creator', 'name email branch semester bio avatar')
      .populate('createdBy', 'name email branch semester bio avatar')
      .populate('members', 'name email branch semester bio avatar');

    return res.json({ message: 'Joined study group successfully!', group: updated });
  } catch (err) {
    next(err);
  }
};

// POST /api/groups/:id/leave
exports.leaveGroup = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid group ID format.' });
    }

    const userId = req.userId.toString();

    const group = await Group.findById(id);
    if (!group) {
      return res.status(404).json({ error: 'Group not found.' });
    }

    const memberIndex = group.members.findIndex((m) => (m._id || m).toString() === userId);
    if (memberIndex === -1) {
      return res.status(400).json({ error: 'You are not a member of this study group.' });
    }

    const ownerId = (group.createdBy?._id || group.createdBy || group.creator?._id || group.creator)?.toString();

    // If owner leaves
    if (ownerId === userId) {
      if (group.members.length === 1) {
        // Sole member exits: delete the group
        await Meeting.deleteMany({ groupId: group._id });
        await Group.findByIdAndDelete(group._id);
        return res.json({
          message: 'You were the sole member. Study group deleted upon exit.',
          deleted: true,
        });
      } else {
        // Transfer ownership to another member
        const remaining = group.members.filter((m) => (m._id || m).toString() !== userId);
        group.creator = remaining[0];
        group.createdBy = remaining[0];
        group.members = remaining;
        await group.save();

        const updated = await Group.findById(group._id)
          .populate('creator', 'name email branch semester bio avatar')
          .populate('createdBy', 'name email branch semester bio avatar')
          .populate('members', 'name email branch semester bio avatar');

        return res.json({
          message: 'You left the study group. Leadership transferred to another peer.',
          group: updated,
        });
      }
    }

    // Regular member leaves
    group.members.splice(memberIndex, 1);
    await group.save();

    const updated = await Group.findById(group._id)
      .populate('creator', 'name email branch semester bio avatar')
      .populate('createdBy', 'name email branch semester bio avatar')
      .populate('members', 'name email branch semester bio avatar');

    return res.json({ message: 'Left study group successfully.', group: updated });
  } catch (err) {
    next(err);
  }
};
