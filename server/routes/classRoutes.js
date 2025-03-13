import express from 'express';
import { createClass, getAnnouncements, addAnnouncement, getAllClasses } from '../controllers/classController.js';

const router = express.Router();

// POST /api/class - Create a new class
router.post('/', createClass);

// GET /api/class/all - Fetch all classes
router.get('/all', getAllClasses);

// POST /api/class/announcements - Fetch announcements for a class
router.post('/announcements', getAnnouncements);

// POST /api/class/add-announcement - Add a new announcement
router.post('/add-announcement', addAnnouncement);

export default router;
