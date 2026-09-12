const Group = require('../models/Group');
const Meeting = require('../models/Meeting');

// GET /api/groups/search
exports.searchGroups = async (req, res, next) => {
  try {
    const { query, subject, branch, semester, availability } = req.query;

    const filter = {};

    if (subject && subject !== 'All' && subject !== 'All Subjects') {
      filter.subject = { $regex: new RegExp(`^${subject}$`, 'i') };
    }

    if (branch && branch !== 'All' && branch !== 'All Departments') {
      filter.branch = { $regex: new RegExp(`^${branch}$`, 'i') };
    }

    if (semester && semester !== 'All' && semester !== 'All Semesters') {
      filter.semester = semester;
    }

    if (query && query.trim()) {
      const q = query.trim();
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    let groups = await Group.find(filter)
      .populate('creator', 'name email branch semester bio avatar')
      .populate('createdBy', 'name email branch semester bio avatar')
      .populate('members', 'name email branch semester bio avatar')
      .sort({ createdAt: -1 });

    if (availability === 'open') {
      groups = groups.filter((g) => {
        const limit = g.maxMembers || g.memberLimit || 5;
        return g.members.length < limit;
      });
    }

    return res.json({ count: groups.length, groups });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/overview
exports.getDashboardOverview = async (req, res, next) => {
  try {
    const userId = req.userId.toString();
    const user = req.user;

    const enrolledGroups = await Group.find({ members: userId })
      .populate('creator', 'name email branch semester bio avatar')
      .populate('createdBy', 'name email branch semester bio avatar')
      .populate('members', 'name email branch semester bio avatar')
      .sort({ updatedAt: -1 });

    const createdGroups = enrolledGroups.filter((g) => {
      const ownerId = (g.createdBy?._id || g.createdBy || g.creator?._id || g.creator)?.toString();
      return ownerId === userId;
    });

    const groupIds = enrolledGroups.map((g) => g._id);

    const upcomingMeetings = await Meeting.find({
      groupId: { $in: groupIds },
    })
      .populate('groupId', 'title subject branch semester')
      .populate('createdBy', 'name email branch avatar')
      .sort({ date: 1, time: 1 })
      .limit(6);

    const recommendedGroups = await Group.find({
      members: { $ne: userId },
      $or: [{ branch: user.branch }, { semester: user.semester }],
    })
      .populate('creator', 'name email branch semester bio avatar')
      .populate('createdBy', 'name email branch semester bio avatar')
      .populate('members', 'name email branch semester bio avatar')
      .limit(4);

    const peerSet = new Set();
    enrolledGroups.forEach((g) => {
      g.members.forEach((m) => {
        const mId = (m._id || m).toString();
        if (mId !== userId) peerSet.add(mId);
      });
    });

    return res.json({
      stats: {
        enrolledCount: enrolledGroups.length,
        createdCount: createdGroups.length,
        upcomingMeetingsCount: upcomingMeetings.length,
        connectedPeersCount: peerSet.size,
      },
      enrolledGroups,
      upcomingMeetings,
      nextSessions: upcomingMeetings.slice(0, 3),
      recommendedGroups,
    });
  } catch (err) {
    next(err);
  }
};
