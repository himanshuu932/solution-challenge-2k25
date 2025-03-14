import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const signup = async (req, res) => {
  // Expecting: { username, email, password, class: classId }
  const { username, email, password, class: classId } = req.body;
  console.log("Signup Data:", req.body);

  try {
    // Check if the student already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user with hashed password and a reference to the class they belong to
    const newUser = new User({ username, email, password: hashedPassword, class: classId });
    await newUser.save();
    console.log("New User Saved:", newUser);

    // Generate JWT Token
    const token = jwt.sign({ id: newUser._id ,class: classId}, process.env.JWT_SECRET);
     
    res.status(201).json({ ok: true, token, user: { username, email, class: classId } });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, class:user.class}, process.env.JWT_SECRET);
    console.log("Login Successful:", user);
    res.json({ ok: true, token, user: { username: user.username, email: user.email, class: user.class } });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
};
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId)
      .populate('notifications.requestedBy', 'username')
      .populate('notifications.donation', 'item');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const deleteNotification = async (req, res) => {
  try {
    const { userId, notificationId } = req.params;
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Filter out the notification with the given ID
    user.notifications = user.notifications.filter(
      (notif) => notif._id.toString() !== notificationId
    );
    await user.save();
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

