import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

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
    <div className="discussion-section" style={{ maxWidth: '600px', margin: 'auto', padding: '10px' }}>
      <h2>Discussion Section</h2>
      <div className="discussion-messages" style={{ border: '1px solid #ccc', height: '300px', overflowY: 'scroll', padding: '10px', marginBottom: '10px', display: 'flex', flexDirection: 'column' }}>
        {messages.length === 0 ? (
          <p>No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div key={msg._id} style={{
              alignSelf: msg.sender === userId ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === userId ? '#DCF8C6' : '#EAEAEA',
              padding: '10px',
              borderRadius: '10px',
              marginBottom: '5px',
              maxWidth: '70%',
            }}>
              <strong>{msg.sender === userId ? 'You' : msg.senderName}:</strong> {msg.message}
              <br />
              <small style={{ fontSize: '0.8em', color: '#555' }}>{new Date(msg.createdAt).toLocaleTimeString()}</small>
            </div>
          ))
        )}
      </div>
      <form onSubmit={handleSendMessage} style={{ display: 'flex' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1, padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px 16px', marginLeft: '8px' }}>Send</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default DiscussionSection;
