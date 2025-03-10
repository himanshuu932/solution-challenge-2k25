import { useState } from "react";
import { motion } from "framer-motion";
import "./styles/SelfEvaluation.css";

export default function SelfEvaluation() {
  const [question, setQuestion] = useState("Select a question");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [image, setImage] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedQuestionNumber, setSelectedQuestionNumber] = useState(1);
  const [visited, setVisited] = useState(Array(4).fill(false)); // Track visited questions
  const [answers, setAnswers] = useState(Array(4).fill(null)); // Track answers

  const questions = [
    "Explain SDG4 in one sentence?",
    "Describe the impact of quality education?",
    "How can education help in sustainable development?",
    "Write an essay on SDG4.",
  ];

  const generateQuestion = () => {
    setQuestion(questions[selectedQuestionNumber - 1]);
    setFeedback("");
    // Mark the question as visited
    const newVisited = [...visited];
    newVisited[selectedQuestionNumber - 1] = true;
    setVisited(newVisited);
  };

  const submitAnswer = () => {
    setFeedback("Evaluating...\nYour response is being processed.");
    setTimeout(() => {
      setFeedback(
        "Great attempt! Try to elaborate more on key points.\nIdeal answer: SDG4 focuses on ensuring inclusive and equitable quality education."
      );
      // Mark the question as answered
      const newAnswers = [...answers];
      newAnswers[selectedQuestionNumber - 1] = "answered"; // For simplicity, assume all answers are correct
      setAnswers(newAnswers);
    }, 2000);
  };

  const handleChatSend = (e) => {
    e.preventDefault();
    const message = e.target.message.value;
    if (message.trim()) {
      setChatMessages([...chatMessages, { text: message, sender: "user" }]);
      e.target.reset();
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          { text: "Thank you for your message! How can I assist you further?", sender: "bot" },
        ]);
      }, 1000);
    }
  };

  return (
    <div className="container">
      {/* Chat Section (Left - 25% width, 100% height) */}
      <div className="right-section">
        {/* Select Question Section (Top 50% height) */}
        <motion.div className="select-question-sidebar" initial={{ y: -50 }} animate={{ y: 0 }}>
          <div className="sidebar-title">Questions</div>
          <div className="question-nav">
            {questions.map((_, idx) => (
              <div
                key={idx}
                className={`question-box ${
                  answers[idx] !== null
                    ? answers[idx] === "correct"
                      ? "correct"
                      : "incorrect"
                    : visited[idx]
                    ? "visited"
                    : "not-visited"
                }`}
                onClick={() => setSelectedQuestionNumber(idx + 1)}
              >
                {idx + 1}
              </div>
            ))}
          </div>
          <div className="status-bar">
            <p>Answered: {answers.filter((a) => a !== null).length}</p>
            <p>Not Answered: {answers.filter((a) => a === null).length}</p>
            <p>Visited: {visited.filter((v) => v).length}</p>
          </div>
        </motion.div>

        {/* Upload Answer Section (Bottom 50% height) */}
        <motion.div
  className="upload-section"
  initial={{ y: 100, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  <h2>Upload Answer</h2>
  <textarea
    className="textarea"
    placeholder="Type your answer..."
    value={answer}
    onChange={(e) => setAnswer(e.target.value)}
  />
  <div className="file-upload-container">
    <label htmlFor="file-upload" className="file-upload-label">
      <span className="upload-icon">📁</span>
      <span className="upload-text">Choose a file</span>
      <input
        id="file-upload"
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
        className="file-input"
      />
    </label>
    {image && (
      <motion.div
        className="file-preview"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <span className="file-name">{image.name}</span>
        <span className="file-remove" onClick={() => setImage(null)}>
          🗑
        </span>
      </motion.div>
    )}
  </div>
  <button onClick={submitAnswer} className="submit-btn">
    Submit Answer
  </button>
</motion.div>
      </div>


      {/* Question and Feedback Section (Middle - 50% width, 100% height) */}
      <motion.div className="question-feedback-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2>Question and Feedback</h2>
        <div className="card">
          <p className="question">{question}</p>
          {feedback && <p className="feedback">{feedback}</p>}
        </div>
      </motion.div>

      {/* Right Section (25% width, 100% height) */}
      <motion.div
  className="chat-section"
  initial={{ x: -100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ duration: 0.5 }}
>
  <h2>Chat with Bot</h2>
  <div className="chat-window">
    {chatMessages.map((msg, index) => (
      <motion.div
        key={index}
        className={`chat-message ${msg.sender}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        {msg.text}
      </motion.div>
    ))}
  </div>
  <form onSubmit={handleChatSend} className="chat-input">
    <input type="text" name="message" placeholder="Type a message..." required />
    <button type="submit" className="send-btn">
      Send
    </button>
  </form>
</motion.div>

    </div>
  );
}