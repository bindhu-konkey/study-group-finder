const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { JWT_SECRET } = require('../middleware/auth');

const signToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, branch, semester, bio, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'A student with this email is already registered.' });
    }

    const user = new User({
      name: name.trim(),
      email: cleanEmail,
      password,
      branch: branch ? branch.trim() : 'Computer Science',
      semester: semester ? semester.trim() : '6th Semester',
      bio: bio ? bio.trim() : 'Eager student looking to learn collaboratively.',
      avatar: avatar || '',
    });

    await user.save();
    const token = signToken(user._id);

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: cleanEmail }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = signToken(user._id);

    return res.json({
      message: 'Logged in successfully!',
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me and GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    return res.json({ user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};

// PUT /api/users/profile and PUT /api/auth/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, branch, semester, bio, avatar, password } = req.body;

    const user = await User.findById(req.userId).select('+password');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (name) user.name = name.trim();
    if (branch) user.branch = branch.trim();
    if (semester) user.semester = semester.trim();
    if (bio !== undefined) user.bio = bio.trim();
    if (avatar !== undefined) user.avatar = avatar.trim();

    if (password && password.trim().length >= 6) {
      user.password = password.trim();
    }

    await user.save();

    return res.json({
      message: 'Profile updated successfully!',
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    return res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};
