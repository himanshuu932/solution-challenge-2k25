// models/Discussion.js
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: { type: String, required: true }, // Added field for the sender's name
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const discussionSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true, unique: true },
  messages: [messageSchema]
});

export default mongoose.model('Chat', discussionSchema);
