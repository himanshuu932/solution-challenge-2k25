import express from 'express';
import { teacherSignup, teacherLogin, addClassToTeacher } from '../controllers/teacherController.js';

const router = express.Router();

// Teacher Signup
router.post('/signup', teacherSignup);

// Teacher Login
router.post('/login', teacherLogin);

// Assign a Class to a Teacher
router.post('/add-class', addClassToTeacher);

export default router;
