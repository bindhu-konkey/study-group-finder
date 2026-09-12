const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Group = require('../models/Group');
const Meeting = require('../models/Meeting');
const Notification = require('../models/Notification');

const seedDatabaseIfNeeded = async () => {
  try {
    const groupCount = await Group.countDocuments();
    if (groupCount > 0) {
      return;
    }

    console.log('[MongoDB Seeder]: Initializing standard university demo dataset in MongoDB...');

    // 1. Get or Create Users
    let u1 = await User.findOne({ email: 'alex.chen@campus.edu' });
    if (!u1) {
      u1 = await User.create({
        name: 'Alex Chen',
        email: 'alex.chen@campus.edu',
        password: 'password123',
        branch: 'Computer Science',
        semester: '6th Semester',
        bio: 'CS junior focused on distributed systems and competitive programming.',
        avatar: '',
      });
    }

    let u2 = await User.findOne({ email: 'maya.patel@campus.edu' });
    if (!u2) {
      u2 = await User.create({
        name: 'Maya Patel',
        email: 'maya.patel@campus.edu',
        password: 'password123',
        branch: 'Electrical Engineering',
        semester: '4th Semester',
        bio: 'EE sophomore passionate about circuit design and embedded microcontrollers.',
        avatar: '',
      });
    }

    let u3 = await User.findOne({ email: 'liam.r@campus.edu' });
    if (!u3) {
      u3 = await User.create({
        name: 'Liam Rodriguez',
        email: 'liam.r@campus.edu',
        password: 'password123',
        branch: 'Mathematics',
        semester: '5th Semester',
        bio: 'Math major working on theoretical physics and linear algebraic proofs.',
        avatar: '',
      });
    }

    let u4 = await User.findOne({ email: 'sophia.k@campus.edu' });
    if (!u4) {
      u4 = await User.create({
        name: 'Sophia Kim',
        email: 'sophia.k@campus.edu',
        password: 'password123',
        branch: 'Data Science',
        semester: '6th Semester',
        bio: 'Data science student researching deep learning and PyTorch capstones.',
        avatar: '',
      });
    }

    // 2. Create Study Groups
    const g1 = await Group.create({
      title: 'CS 314: Advanced Algorithms & LeetCode Sprint',
      subject: 'Computer Science',
      description:
        'Weekly deep dive into dynamic programming, graph theory, and algorithmic complexity to ace technical interviews and exam prep.',
      memberLimit: 5,
      creator: u1._id,
      createdBy: u1._id,
      members: [u1._id, u2._id],
      branch: 'Computer Science',
      semester: '6th Semester',
      tags: ['Algorithms', 'LeetCode', 'GraphTheory', 'TechInterview'],
    });

    const g2 = await Group.create({
      title: 'MATH 240: Linear Algebra & Vector Spaces',
      subject: 'Mathematics',
      description:
        'Collaborative problem-solving group covering eigenvalues, Gram-Schmidt orthogonalization, and inner product spaces.',
      memberLimit: 4,
      creator: u3._id,
      createdBy: u3._id,
      members: [u3._id, u1._id],
      branch: 'Mathematics',
      semester: '5th Semester',
      tags: ['LinearAlgebra', 'Eigenvalues', 'ProofBased'],
    });

    const g3 = await Group.create({
      title: 'CHEM 231: Organic Synthesis & Spectroscopy',
      subject: 'Chemistry',
      description:
        'Reaction mechanism review, stereochemistry practice, and NMR/IR spectral interpretation workshops.',
      memberLimit: 6,
      creator: u2._id,
      createdBy: u2._id,
      members: [u2._id],
      branch: 'Chemistry',
      semester: '4th Semester',
      tags: ['OrganicChem', 'Synthesis', 'Spectroscopy'],
    });

    const g4 = await Group.create({
      title: 'EE 302: Signals, Systems & DSP Workshop',
      subject: 'Electrical',
      description:
        'Mastering Fourier transforms, Laplace domains, and filter design with real-world MATLAB simulation sessions.',
      memberLimit: 3,
      creator: u2._id,
      createdBy: u2._id,
      members: [u2._id, u3._id, u4._id], // Full capacity (3/3) for testing
      branch: 'Electrical Engineering',
      semester: '6th Semester',
      tags: ['DSP', 'Signals', 'MATLAB', 'Filters'],
    });

    const g5 = await Group.create({
      title: 'DATA 401: Deep Learning & Neural Networks',
      subject: 'Data Science',
      description:
        'Hands-on cohort building transformers, CNN architectures, and diffusion models using PyTorch.',
      memberLimit: 5,
      creator: u4._id,
      createdBy: u4._id,
      members: [u4._id, u1._id],
      branch: 'Data Science',
      semester: '6th Semester',
      tags: ['DeepLearning', 'PyTorch', 'Transformers'],
    });

    // 3. Create Study Sessions
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    const dayAfterStr = dayAfter.toISOString().split('T')[0];

    await Meeting.create({
      groupId: g1._id,
      title: 'Graph Traversal & Dijkstra Implementation',
      date: tomorrowStr,
      time: '4:00 PM - 6:00 PM',
      startTime: '4:00 PM',
      endTime: '6:00 PM',
      meetingType: 'online',
      location: 'Campus Library Room 302',
      meetingLink: 'https://meet.google.com/abc-stud-pod',
      agenda: 'Solve 3 Hard Dijkstra and Bellman-Ford problems on whiteboard.',
      createdBy: u1._id,
    });

    await Meeting.create({
      groupId: g2._id,
      title: 'Eigenvalues & Diagonalization Practice',
      date: dayAfterStr,
      time: '2:30 PM - 4:00 PM',
      startTime: '2:30 PM',
      endTime: '4:00 PM',
      meetingType: 'online',
      location: 'Math Building Hall 204',
      meetingLink: 'https://meet.google.com/xyz-math-group',
      agenda: 'Work through problem set 5 and prove spectral theorem lemma.',
      createdBy: u3._id,
    });

    // 4. Create Initial Notifications
    await Notification.create({
      userId: u1._id,
      title: 'Upcoming Session Tomorrow',
      message: 'Your Graph Traversal session starts tomorrow at 4:00 PM.',
      type: 'session_reminder',
      link: `/groups/${g1._id}`,
      read: false,
    });

    await Notification.create({
      userId: u1._id,
      title: 'Welcome to Study Group Finder',
      message: 'You are an enrolled organizer of CS 314 study circle.',
      type: 'general',
      link: `/groups/${g1._id}`,
      read: true,
    });

    console.log('[MongoDB Seeder]: Successfully seeded academic database.');
  } catch (err) {
    console.error('[MongoDB Seeder Error]:', err.message);
  }
};

module.exports = { seedDatabaseIfNeeded };
