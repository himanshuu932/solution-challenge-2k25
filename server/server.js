import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import Route from './routes/Route.js';
import chatRoutes from './routes/chatRoutes.js';
import classRoutes from './routes/classRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
app.use('/api/auth', Route);
app.use('/api/chat', chatRoutes);
app.use('/api/class', classRoutes);
app.use('/api/teachers', teacherRoutes);

// MongoDB Connection with Logging
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
  })
  .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// API Routes

