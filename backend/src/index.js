const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = 4000;

/* =========================
   GROUP DATA
========================= */

const groups = [
  {
    id: "1",
    subject: "Java Programming",
    description:
      "Practice Java concepts, coding problems and interview questions.",
    maxMembers: 15,
    members: ["Student1", "Student2", "Student3"],
    color: "purple",
    icon: "☕",
  },
  {
    id: "2",
    subject: "Computer Networks",
    description:
      "Discuss networking concepts and prepare for examinations.",
    maxMembers: 10,
    members: ["Student4", "Student5"],
    color: "blue",
    icon: "●",
  },
  {
    id: "3",
    subject: "Database Management",
    description:
      "Learn SQL, normalization and database concepts together.",
    maxMembers: 10,
    members: ["Student6"],
    color: "pink",
    icon: "▤",
  },
];

/* =========================
   MEETING DATA
========================= */

const meetings = [];

/* =========================
   HEALTH
========================= */

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

/* =========================
   GET GROUPS
   MEMBER 3
========================= */

app.get("/api/groups", (req, res) => {
  const formattedGroups = groups.map((group) => ({
    id: group.id,
    subject: group.subject,
    description: group.description,
    members: `${group.members.length} / ${group.maxMembers}`,
    memberCount: group.members.length,
    maxMembers: group.maxMembers,
    availability:
      group.members.length >= group.maxMembers
        ? "Full"
        : "Open",
    color: group.color,
    icon: group.icon,
    joinedMembers: group.members,
  }));

  res.json(formattedGroups);
});

/* =========================
   CREATE GROUP
========================= */

app.post("/api/groups", (req, res) => {
  const {
    subject,
    description,
    maxMembers,
    color,
    icon,
  } = req.body;

  if (!subject || !description || !maxMembers) {
    return res.status(400).json({
      message:
        "Subject, description and maximum members are required",
    });
  }

  const newGroup = {
    id: Date.now().toString(),
    subject,
    description,
    maxMembers: Number(maxMembers),
    members: [],
    color: color || "purple",
    icon: icon || "☕",
  };

  groups.push(newGroup);

  res.status(201).json(newGroup);
});

/* =========================
   JOIN GROUP
   MEMBER 3
========================= */

app.post("/api/groups/:id/join", (req, res) => {
  const group = groups.find(
    (group) => group.id === req.params.id
  );

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({
      message: "Username is required",
    });
  }

  if (!group) {
    return res.status(404).json({
      message: "Group not found",
    });
  }

  if (group.members.includes(username)) {
    return res.status(400).json({
      message: "You already joined this group",
    });
  }

  if (group.members.length >= group.maxMembers) {
    return res.status(400).json({
      message: "This group is full",
    });
  }

  group.members.push(username);

  res.json({
    message: "Successfully joined the group",
    memberCount: group.members.length,
    maxMembers: group.maxMembers,
  });
});

/* =========================
   LEAVE GROUP
   MEMBER 3
========================= */

app.delete("/api/groups/:id/leave", (req, res) => {
  const group = groups.find(
    (group) => group.id === req.params.id
  );

  const { username } = req.body;

  if (!username) {
    return res.status(400).json({
      message: "Username is required",
    });
  }

  if (!group) {
    return res.status(404).json({
      message: "Group not found",
    });
  }

  if (!group.members.includes(username)) {
    return res.status(400).json({
      message: "You are not a member of this group",
    });
  }

  group.members = group.members.filter(
    (member) => member !== username
  );

  res.json({
    message: "Successfully left the group",
    memberCount: group.members.length,
    maxMembers: group.maxMembers,
  });
});

/* =========================
   CREATE MEETING
   MEMBER 4
========================= */

app.post("/api/meetings", (req, res) => {
  const {
    groupId,
    title,
    date,
    time,
    location,
    meetingLink,
  } = req.body;

  if (!groupId || !title || !date || !time) {
    return res.status(400).json({
      message:
        "Group, title, date and time are required",
    });
  }

  const group = groups.find(
    (group) => group.id === groupId
  );

  if (!group) {
    return res.status(404).json({
      message: "Group not found",
    });
  }

  const meeting = {
    id: Date.now().toString(),
    groupId,
    groupName: group.subject,
    title,
    date,
    time,
    location: location || "",
    meetingLink: meetingLink || "",
  };

  meetings.push(meeting);

  res.status(201).json({
    message: "Meeting created successfully",
    meeting,
  });
});

/* =========================
   GET MEETINGS
   MEMBER 4
========================= */

app.get("/api/meetings", (req, res) => {
  res.json(meetings);
});

/* =========================
   GET GROUP MEETINGS
========================= */

app.get("/api/groups/:id/meetings", (req, res) => {
  const groupMeetings = meetings.filter(
    (meeting) => meeting.groupId === req.params.id
  );

  res.json(groupMeetings);
});

/* =========================
   DELETE MEETING
   MEMBER 4
========================= */

app.delete("/api/meetings/:id", (req, res) => {
  const index = meetings.findIndex(
    (meeting) => meeting.id === req.params.id
  );

  if (index === -1) {
    return res.status(404).json({
      message: "Meeting not found",
    });
  }

  meetings.splice(index, 1);

  res.json({
    message: "Meeting deleted successfully",
  });
});

/* =========================
   START SERVER
========================= */

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(
    `Health check: http://localhost:${PORT}/api/health`
  );
});