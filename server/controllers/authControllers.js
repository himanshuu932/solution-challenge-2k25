import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Class from '../models/Class.js';
import Test from '../models/test.js';
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


export const getProfile = async (req, res) => {
  try {
    console.log("User ID:", req.params.id);
    const userId = req.params.id;
    
    let user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Fetch the class details using the user's class reference
    const classDetails = await Class.findById(user.class);
    if (!classDetails) {
      return res.status(404).json({ message: 'Class not found' });
    }
    
    // Convert the user document to a plain object
    user = user.toObject();
    
    // Attach the class name to the user object
    user.className = classDetails.name;
    console.log("User Profile - Class Name:", classDetails.name);
    
    // Initialize counters for total score and total questions
    let totalScore = 0;
    let totalQuestions = 0;
    
    // If the user has test attempts, process each one
    if (user.tests && user.tests.length > 0) {
      // Fetch details for each test concurrently
      const testDetailsArray = await Promise.all(
        user.tests.map(async (testAttempt) => {
          const testDoc = await Test.findById(testAttempt.test);
          return {
            score: testAttempt.score,
            numberOfQuestions: testDoc ? testDoc.numberOfQuestions : 0
          };
        })
      );
      
      // Sum the scores and total number of questions
      testDetailsArray.forEach(({ score, numberOfQuestions }) => {
        totalScore += score;
        totalQuestions += numberOfQuestions;
      });
    }
    
    // Calculate average score: totalScore divided by totalQuestions (if any)
    const averageScore = totalQuestions > 0 ? (totalScore / totalQuestions) : 0;
    
    // Attach the computed averageScore to the user object
    user.averageScore = averageScore;
    
    // Remove notifications from the response if not needed in the frontend
    delete user.notifications;
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

