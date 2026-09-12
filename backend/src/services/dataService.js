const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { isDbConnected } = require('../config/db');
const User = require('../models/User');
const Group = require('../models/Group');
const Meeting = require('../models/Meeting');

// In-Memory Fallback Collections
const memoryStore = {
  users: [],
  groups: [],
  meetings: [],
  notifications: [],
};

// Seed initial in-memory data
const initMemorySeed = async () => {
  if (memoryStore.users.length > 0) return;

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  const u1 = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Alex Chen',
    email: 'alex.chen@campus.edu',
    password: hashedPassword,
    branch: 'Computer Science',
    semester: '6th Semester',
    bio: 'CS junior focused on distributed systems and competitive programming.',
    avatar: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const u2 = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Maya Patel',
    email: 'maya.patel@campus.edu',
    password: hashedPassword,
    branch: 'Electrical Engineering',
    semester: '4th Semester',
    bio: 'EE sophomore passionate about circuit design and embedded microcontrollers.',
    avatar: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const u3 = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Liam Rodriguez',
    email: 'liam.r@campus.edu',
    password: hashedPassword,
    branch: 'Mathematics',
    semester: '5th Semester',
    bio: 'Math major working on theoretical physics and linear algebraic proofs.',
    avatar: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const u4 = {
    _id: new mongoose.Types.ObjectId().toString(),
    name: 'Sophia Kim',
    email: 'sophia.k@campus.edu',
    password: hashedPassword,
    branch: 'Data Science',
    semester: '6th Semester',
    bio: 'Data science student researching deep learning and PyTorch capstones.',
    avatar: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.users.push(u1, u2, u3, u4);

  const g1 = {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'CS 314: Advanced Algorithms & LeetCode Sprint',
    subject: 'Computer Science',
    description: 'Weekly deep dive into dynamic programming, graph theory, and algorithmic complexity to ace technical interviews and exam prep.',
    memberLimit: 5,
    creator: u1._id,
    members: [u1._id, u2._id],
    branch: 'Computer Science',
    semester: '6th Semester',
    tags: ['Algorithms', 'LeetCode', 'GraphTheory', 'TechInterview'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const g2 = {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'MATH 240: Linear Algebra & Vector Spaces',
    subject: 'Mathematics',
    description: 'Collaborative problem-solving group covering eigenvalues, Gram-Schmidt orthogonalization, and inner product spaces.',
    memberLimit: 4,
    creator: u3._id,
    members: [u3._id, u1._id],
    branch: 'Mathematics',
    semester: '5th Semester',
    tags: ['LinearAlgebra', 'Eigenvalues', 'ProofBased'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const g3 = {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'CHEM 231: Organic Synthesis & Spectroscopy',
    subject: 'Chemistry',
    description: 'Reaction mechanism review, stereochemistry practice, and NMR/IR spectral interpretation workshops.',
    memberLimit: 6,
    creator: u2._id,
    members: [u2._id],
    branch: 'Chemistry',
    semester: '4th Semester',
    tags: ['OrganicChem', 'Synthesis', 'Spectroscopy'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const g4 = {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'EE 302: Signals, Systems & DSP Workshop',
    subject: 'Electrical',
    description: 'Mastering Fourier transforms, Laplace domains, and filter design with real-world MATLAB simulation sessions.',
    memberLimit: 3,
    creator: u2._id,
    members: [u2._id, u3._id, u4._id], // Full group for capacity test!
    branch: 'Electrical Engineering',
    semester: '6th Semester',
    tags: ['DSP', 'Signals', 'MATLAB', 'Filters'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const g5 = {
    _id: new mongoose.Types.ObjectId().toString(),
    title: 'DATA 401: Deep Learning & Neural Networks',
    subject: 'Data Science',
    description: 'Hands-on cohort building transformers, CNN architectures, and diffusion models using PyTorch.',
    memberLimit: 5,
    creator: u4._id,
    members: [u4._id, u1._id],
    branch: 'Data Science',
    semester: '6th Semester',
    tags: ['DeepLearning', 'PyTorch', 'Transformers'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.groups.push(g1, g2, g3, g4, g5);

  const m1 = {
    _id: new mongoose.Types.ObjectId().toString(),
    groupId: g1._id,
    title: 'Graph Traversal & Dijkstra Implementation',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '4:00 PM - 6:00 PM',
    startTime: '4:00 PM',
    endTime: '6:00 PM',
    meetingType: 'online',
    location: 'Campus Library Room 302',
    meetingLink: 'https://meet.google.com/abc-stud-pod',
    agenda: 'Solve 3 Hard Dijkstra and Bellman-Ford problems on whiteboard.',
    createdBy: u1._id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const m2 = {
    _id: new mongoose.Types.ObjectId().toString(),
    groupId: g2._id,
    title: 'Eigenvalues & Diagonalization Practice',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    time: '2:30 PM - 4:00 PM',
    startTime: '2:30 PM',
    endTime: '4:00 PM',
    meetingType: 'online',
    location: 'Math Building Hall 204',
    meetingLink: 'https://meet.google.com/xyz-math-group',
    agenda: 'Work through problem set 5 and prove spectral theorem lemma.',
    createdBy: u3._id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  memoryStore.meetings.push(m1, m2);

  // Seed sample initial notifications
  const n1 = {
    _id: new mongoose.Types.ObjectId().toString(),
    userId: u1._id,
    title: 'Upcoming Session Tomorrow',
    message: 'Your Graph Traversal session starts tomorrow at 4:00 PM in Library Room 302.',
    type: 'session_reminder',
    link: `/groups/${g1._id}`,
    read: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  };

  const n2 = {
    _id: new mongoose.Types.ObjectId().toString(),
    userId: u1._id,
    title: 'Welcome to CS 314 Study Group',
    message: 'You are an enrolled member of CS 314: Operating Systems & Concurrency.',
    type: 'group_join',
    link: `/groups/${g3._id}`,
    read: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  };

  memoryStore.notifications.push(n1, n2);
};

// Initialize seed on startup
initMemorySeed();

// Helpers for in-memory population
const populateGroup = (group) => {
  const creator = memoryStore.users.find((u) => u._id.toString() === group.creator.toString()) || {
    _id: group.creator,
    name: 'Student Peer',
    email: 'peer@campus.edu',
    branch: group.branch || 'Engineering',
    semester: group.semester || '6th Semester',
  };

  const members = (group.members || []).map((mId) => {
    const user = memoryStore.users.find((u) => u._id.toString() === mId.toString());
    if (user) {
      const { password, ...safeUser } = user;
      return safeUser;
    }
    return { _id: mId, name: 'Student Peer', email: 'peer@campus.edu' };
  });

  const { password, ...safeCreator } = creator;

  const currentMembers = members.length;
  const seatsLeft = Math.max(0, group.memberLimit - currentMembers);
  const isFull = currentMembers >= group.memberLimit;

  return {
    ...group,
    creator: safeCreator,
    createdBy: safeCreator,
    members,
    maxMembers: group.memberLimit,
    seatsLeft,
    isFull,
  };
};

module.exports = {
  memoryStore,
  initMemorySeed,
  populateGroup,
};
