import Teacher from '../models/Teacher.js';
import Class from '../models/Class.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const teacherSignup = async (req, res) => {
  // Expecting: { username, email, password, classes } 
  // where classes is an array of class IDs the teacher is assigned to.
  const { username, email, password, classes } = req.body;
  console.log("Teacher Signup Data:", req.body);

  try {
    // Check if teacher already exists
    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) return res.status(400).json({ msg: 'Teacher already exists' });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new teacher with hashed password and assigned classes
    const newTeacher = new Teacher({ username, email, password: hashedPassword, classes });
    await newTeacher.save();
    console.log("New Teacher Saved:", newTeacher);

    // Generate JWT Token
    const token = jwt.sign({ id: newTeacher._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ ok: true, token, teacher: { username, email, classes } });
  } catch (err) {
    console.error("Teacher Signup Error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
};

export const teacherLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const teacher = await Teacher.findOne({ email });
    if (!teacher) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, teacher.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: teacher._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ ok: true, token, teacher: { username: teacher.username, email: teacher.email, classes: teacher.classes } });
  } catch (err) {
    console.error("Teacher Login Error:", err);
    res.status(500).json({ msg: 'Server error' });
  }
};


export const addClassToTeacher = async (req, res) => {
  try {
    const { teacherId, classId } = req.body;

    // Validate teacher and class
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) return res.status(404).json({ msg: 'Teacher not found' });

    const classExists = await Class.findById(classId);
    if (!classExists) return res.status(404).json({ msg: 'Class not found' });

    // Add class to teacher's classes array (if not already added)
    if (!teacher.classes.includes(classId)) {
      teacher.classes.push(classId);
      await teacher.save();
    }

    res.json({ ok: true, msg: 'Class assigned successfully', teacher });
  } catch (error) {
    console.error("Error adding class to teacher:", error);
    res.status(500).json({ msg: 'Server error' });
  }
};
