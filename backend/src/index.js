console.log("RUNNING NEW BACKEND FILE");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ============================================
// TEMPORARY GROUP STORAGE
// ============================================

let groups = [
  {
    id: "1",
    name: "Java Study Group",
    subject: "Java Programming",
    description: "Practice Java concepts and coding problems.",
    memberLimit: 15,
    creatorId: "demo-user",
    createdAt: new Date().toISOString(),
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function validateGroupData(body) {
  const { name, subject, description, memberLimit } = body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof subject !== "string" ||
    !subject.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    memberLimit === undefined ||
    memberLimit === null ||
    memberLimit === ""
  ) {
    return "Name, subject, description and member limit are required";
  }

  if (name.trim().length > 100) {
    return "Group name must not exceed 100 characters";
  }

  if (subject.trim().length > 100) {
    return "Subject must not exceed 100 characters";
  }

  if (description.trim().length > 1000) {
    return "Description must not exceed 1000 characters";
  }

  const limit = Number(memberLimit);

  if (!Number.isInteger(limit) || limit < 1 || limit > 1000) {
    return "Member limit must be a whole number between 1 and 1000";
  }

  return null;
}

// ============================================
// ROOT ROUTE
// ============================================

app.get("/", (req, res) => {
  res.json({
    message: "Study Group Finder backend is running",
  });
});

// ============================================
// HEALTH CHECK
// ============================================

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Backend connected successfully",
  });
});

// ============================================
// READ: GET ALL GROUPS
// ============================================

app.get("/api/groups", (req, res) => {
  res.json(groups);
});

// ============================================
// READ: GET SINGLE GROUP
// ============================================

app.get("/api/groups/:id", (req, res) => {
  const group = groups.find((group) => group.id === req.params.id);

  if (!group) {
    return res.status(404).json({
      message: "Group not found",
    });
  }

  res.json(group);
});

// ============================================
// READ: GET MY GROUPS
// ============================================

app.get("/api/groups/my/:creatorId", (req, res) => {
  const userGroups = groups.filter(
    (group) => group.creatorId === req.params.creatorId
  );

  res.json(userGroups);
});

// ============================================
// CREATE: POST A NEW GROUP
// ============================================

app.post("/api/groups", (req, res) => {
  const { creatorId } = req.body;

  if (typeof creatorId !== "string" || !creatorId.trim()) {
    return res.status(400).json({
      message: "Creator ID is required",
    });
  }

  const validationError = validateGroupData(req.body);

  if (validationError) {
    return res.status(400).json({
      message: validationError,
    });
  }

  const newGroup = {
    id: Date.now().toString(),
    name: req.body.name.trim(),
    subject: req.body.subject.trim(),
    description: req.body.description.trim(),
    memberLimit: Number(req.body.memberLimit),
    creatorId: creatorId.trim(),
    createdAt: new Date().toISOString(),
  };

  groups.push(newGroup);

  res.status(201).json({
    message: "Group created successfully",
    group: newGroup,
  });
});

// ============================================
// UPDATE: EDIT OWN GROUP
// ============================================

app.put("/api/groups/:id", (req, res) => {
  const { id } = req.params;
  const { creatorId } = req.body;

  if (typeof creatorId !== "string" || !creatorId.trim()) {
    return res.status(400).json({
      message: "Creator ID is required",
    });
  }

  const group = groups.find((group) => group.id === id);

  if (!group) {
    return res.status(404).json({
      message: "Group not found",
    });
  }

  if (group.creatorId !== creatorId.trim()) {
    return res.status(403).json({
      message: "You can only edit your own group",
    });
  }

  const validationError = validateGroupData(req.body);

  if (validationError) {
    return res.status(400).json({
      message: validationError,
    });
  }

  group.name = req.body.name.trim();
  group.subject = req.body.subject.trim();
  group.description = req.body.description.trim();
  group.memberLimit = Number(req.body.memberLimit);
  group.updatedAt = new Date().toISOString();

  res.json({
    message: "Group updated successfully",
    group,
  });
});

// ============================================
// DELETE: DELETE OWN GROUP
// ============================================

app.delete("/api/groups/:id", (req, res) => {
  const { id } = req.params;
  const { creatorId } = req.body;

  if (typeof creatorId !== "string" || !creatorId.trim()) {
    return res.status(400).json({
      message: "Creator ID is required",
    });
  }

  const groupIndex = groups.findIndex((group) => group.id === id);

  if (groupIndex === -1) {
    return res.status(404).json({
      message: "Group not found",
    });
  }

  if (groups[groupIndex].creatorId !== creatorId.trim()) {
    return res.status(403).json({
      message: "You can only delete your own group",
    });
  }

  const deletedGroup = groups.splice(groupIndex, 1)[0];

  res.json({
    message: "Group deleted successfully",
    group: deletedGroup,
  });
});

// ============================================
// ROUTE NOT FOUND HANDLER
// ============================================

app.use((req, res) => {
  res.status(404).json({
    message: "API route not found",
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    message: "Internal server error",
  });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});