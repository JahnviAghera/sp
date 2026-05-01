const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!email || !password || !name) return res.status(400).json({ message: 'Missing fields' });
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered' });
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password || '');
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    const token = signToken(user);
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.requireAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const updates = req.body;
    delete updates.password; // handle password separately
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select('-password');
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Google OAuth callback handler — passport sets req.user
exports.googleCallback = async (req, res) => {
  try {
    const user = req.user; // from passport
    const token = signToken(user);
    // In production you might redirect to frontend with token, here we return JSON
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Google callback error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
