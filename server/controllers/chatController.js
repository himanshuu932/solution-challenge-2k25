// controllers/chatController.js
import Chat from '../models/Discussion.js';
import User from '../models/User.js';

export const getChats = async (req, res) => {
  try {
    const { classId } = req.query;
    // Find the discussion document for the given classId
    const chat = await Chat.findOne({ classId });
    if (!chat) {
      // If no document exists, return an empty array
      return res.json([]);
    }
    // Sort messages by creation time if needed
    const messages = chat.messages.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat messages' });
  }
};

export const createChat = async (req, res) => {
  try {
    // Expecting: { class: classId, sender, message }
    const { class: classId, sender, message } = req.body;
    console.log(req.body);
    // Fetch the user to get the username
    const user = await User.findById(sender);
    if (!user) {
        console.log('User not found');
      return res.status(404).json({ error: 'User not found' });
    }
    
    const newMessage = {
      sender,
      senderName: user.username, 
      message,
      createdAt: new Date()
    };

   console.log(newMessage);
    let chat = await Chat.findOne({ classId });
    if (!chat) {
      // Create a new discussion document if none exists
      chat = new Chat({ classId, messages: [newMessage] });
    } else {
      // Append the new message to the messages array
      chat.messages.push(newMessage);
    }
    await chat.save();
    console.log(chat);
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: 'Error sending chat message' });
  }
};
