const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');
const meetingController = require('../controllers/meetingController');
const { searchGroups } = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

// Public or optionally authenticated
router.get('/search', searchGroups);
router.get('/', groupController.getAllGroups);

// Authenticated group routes
router.get('/my-groups', authMiddleware, groupController.getMyGroups);
router.get('/:id', groupController.getGroupById);
router.post('/', authMiddleware, groupController.createGroup);
router.put('/:id', authMiddleware, groupController.updateGroup);
router.delete('/:id', authMiddleware, groupController.deleteGroup);

// Membership routes (Join / Leave)
router.post('/:id/join', authMiddleware, groupController.joinGroup);
router.post('/:id/leave', authMiddleware, groupController.leaveGroup);

// Nested Meeting routes for group
router.post('/:id/meetings', authMiddleware, meetingController.createMeeting);
router.get('/:id/meetings', meetingController.getGroupMeetings);
router.post('/:id/sessions', authMiddleware, meetingController.createMeeting);
router.get('/:id/sessions', meetingController.getGroupMeetings);

module.exports = router;
