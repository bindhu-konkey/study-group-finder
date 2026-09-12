const express = require('express');
const router = express.Router();
const meetingController = require('../controllers/meetingController');
const { authMiddleware } = require('../middleware/auth');

router.get('/my-sessions', authMiddleware, meetingController.getMySessions);
router.put('/:id', authMiddleware, meetingController.updateMeeting);
router.delete('/:id', authMiddleware, meetingController.deleteMeeting);

module.exports = router;
