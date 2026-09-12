const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/groups', (req, res) => {
  const groups = [
    {
      subject: "Java Programming",
      description:
        "Practice Java concepts, coding problems and interview questions.",
      members: "12 / 15",
      availability: "Open",
      color: "purple",
      icon: "☕"
    },
    {
      subject: "Computer Networks",
      description:
        "Discuss networking concepts and prepare for examinations.",
      members: "8 / 10",
      availability: "Open",
      color: "blue",
      icon: "●"
    },
    {
      subject: "Database Management",
      description:
        "Learn SQL, normalization and database concepts together.",
      members: "6 / 10",
      availability: "Open",
      color: "pink",
      icon: "▤"
    }
  ];

  res.json(groups);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});