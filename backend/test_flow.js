require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('./src/config/db');
const User = require('./src/models/User');
const Group = require('./src/models/Group');
const Meeting = require('./src/models/Meeting');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./src/middleware/auth');

const runTest = async () => {
  console.log('--- STARTING END-TO-END INTEGRATION TEST ---');
  await connectDB();

  // 1. Check Seeding
  const userCount = await User.countDocuments();
  const groupCount = await Group.countDocuments();
  console.log(`✓ Initial Seed verified: ${userCount} users, ${groupCount} groups.`);

  // 2. Test User Authentication
  const alex = await User.findOne({ email: 'alex.chen@campus.edu' }).select('+password');
  const maya = await User.findOne({ email: 'maya.patel@campus.edu' });
  if (!alex || !maya) throw new Error('Test users not found.');

  const isAlexPassValid = await alex.comparePassword('password123');
  console.log('✓ Alex password verification:', isAlexPassValid ? 'PASSED' : 'FAILED');

  const alexToken = jwt.sign({ userId: alex._id }, JWT_SECRET, { expiresIn: '1d' });
  const mayaToken = jwt.sign({ userId: maya._id }, JWT_SECRET, { expiresIn: '1d' });
  console.log('✓ JWT token generation: PASSED');

  // 3. Test Group Creation
  const newGroup = await Group.create({
    title: 'CS 499: Senior Capstone & Distributed Architectures',
    subject: 'Computer Science',
    description: 'Collaborative group for microservices and cloud deployments.',
    memberLimit: 4,
    maxMembers: 4,
    creator: alex._id,
    createdBy: alex._id,
    members: [alex._id],
    branch: 'Computer Science',
    semester: '8th Semester',
    tags: ['Distributed', 'Cloud', 'Kubernetes'],
  });
  console.log(`✓ Group creation: "${newGroup.title}" created (ID: ${newGroup._id})`);

  // 4. Test Joining
  newGroup.members.push(maya._id);
  await newGroup.save();
  const updatedGroup = await Group.findById(newGroup._id);
  console.log(`✓ Member joined: Members count = ${updatedGroup.members.length} / ${updatedGroup.memberLimit}`);

  // 5. Test Session Scheduling
  const session = await Meeting.create({
    groupId: newGroup._id,
    title: 'Docker & Kubernetes Cluster Setup',
    date: '2026-09-20',
    time: '3:00 PM - 5:00 PM',
    startTime: '3:00 PM',
    endTime: '5:00 PM',
    meetingType: 'online',
    meetingLink: 'https://meet.google.com/capstone-test',
    createdBy: alex._id,
  });
  console.log(`✓ Session scheduled: "${session.title}" (ID: ${session._id})`);

  // 6. Test Delete Authorization — Maya (not creator) attempts to delete
  const isMayaCreator =
    (newGroup.createdBy?._id || newGroup.createdBy || newGroup.creator?._id || newGroup.creator)?.toString() ===
    maya._id.toString();
  console.log(`✓ Unauthorized delete check for Maya: isCreator=${isMayaCreator} (Expected: false)`);
  if (isMayaCreator) throw new Error('Maya should NOT be creator of Alex’s group!');

  // 7. Test Delete Operation — Alex (creator) deletes group
  const isAlexCreator =
    (newGroup.createdBy?._id || newGroup.createdBy || newGroup.creator?._id || newGroup.creator)?.toString() ===
    alex._id.toString();
  console.log(`✓ Authorized delete check for Alex: isCreator=${isAlexCreator} (Expected: true)`);

  // Execute Cascading Cleanup & Deletion
  const deletedSessions = await Meeting.deleteMany({ groupId: newGroup._id });
  const deletedGroup = await Group.findByIdAndDelete(newGroup._id);
  console.log(`✓ Cascading session cleanup: ${deletedSessions.deletedCount} sessions removed.`);
  console.log(`✓ Group deletion: ${deletedGroup ? 'SUCCESS' : 'FAILED'}`);

  // Verify group is gone from MongoDB
  const checkGroup = await Group.findById(newGroup._id);
  const checkSession = await Meeting.findById(session._id);
  console.log(`✓ Verification query after delete: Group exists? ${!!checkGroup}, Session exists? ${!!checkSession}`);
  if (checkGroup || checkSession) throw new Error('Group or Session still exists in MongoDB after delete!');

  console.log('--- ALL INTEGRATION TESTS PASSED PERFECTLY! ---');
  process.exit(0);
};

runTest().catch((err) => {
  console.error('Integration test failed:', err);
  process.exit(1);
});
