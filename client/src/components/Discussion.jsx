import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import './styles/DiscussionSection.css'; // Import external CSS

const DiscussionSection = () => {
  const token = localStorage.getItem('token');
  let userId = null, classId = null;

  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      userId = decodedToken.id;
      classId = decodedToken.class;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);

  const fetchMessages = async () => {
    if (!classId) return;
    try {
      const response = await fetch(`/api/chat?classId=${classId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch discussion messages');
      }
      const data = await response.json();
      setMessages(data);
    } catch (err) {
      setError('Error fetching discussion messages: ' + err.message);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [classId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          class: classId,
          sender: userId,
          message: newMessage,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      setNewMessage('');
      fetchMessages();
    } catch (err) {
      setError('Error sending message: ' + err.message);
    }
  };

  return (
    <div className="discussion-section">
      <h2 className="discussion-title">Discussion Section</h2>
      <div className="discussion-messages">
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`message ${msg.sender === userId ? 'self' : 'other'}`}
            >
              <strong>{msg.sender === userId ? 'You' : msg.senderName}:</strong> {msg.message}
              <br />
              <small>{new Date(msg.createdAt).toLocaleTimeString()}</small>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default DiscussionSection;