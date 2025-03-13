// routes/chatRoutes.js
import express from 'express';
import { getChats, createChat } from '../controllers/chatController.js';

const router = express.Router();

// GET /api/chat?classId=<ID> to fetch chat messages for a given class
router.get('/', getChats);

// POST /api/chat to post a new chat message
router.post('/', createChat);

export default router;
