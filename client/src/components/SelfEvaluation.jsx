import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "./styles/SelfEvaluation.css";
import Latex from "react-latex"; // For rendering LaTeX formulas
import "katex/dist/katex.min.css"; // Import KaTeX CSS
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function SelfEvaluation() {
  const [question, setQuestion] = useState("Select a question");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null); // Tracks selected option (1 or 2)
  const [uploadedQuestionFile, setUploadedQuestionFile] = useState(null); // For option 1
  const [uploadedAnswerFile, setUploadedAnswerFile] = useState(null); // For option 1
  const [generatedQuestions, setGeneratedQuestions] = useState([]); // For option 2
  const [uploadedAnswers, setUploadedAnswers] = useState([]); // For option 2

  const questions = [
    "Explain SDG4 in one sentence?",
    "Describe the impact of quality education?",
    "How can education help in sustainable development?",
    "Write an essay on SDG4.",
  ];

  // Handle file upload for drag and drop
  const handleFileUpload = (setFile, file) => {
    setFile(file);
  };

  // Handle option 1: Review your answer
  const handleReviewAnswer = () => {
    setSelectedOption(1);
  };

  // Handle option 2: Generate questions from chatbot
  const handleGenerateQuestions = async () => {
    setSelectedOption(2);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/generateQuestions");
      setGeneratedQuestions(response.data.questions); // Assuming the response contains an array of questions
      setUploadedAnswers(Array(response.data.questions.length).fill(null)); // Initialize uploaded answers array
    } catch (error) {
      console.error("Error generating questions:", error);
    }
  };

  // Handle submitting answers for generated questions (option 2)
  const submitGeneratedAnswers = () => {
    setFeedback("Evaluating...\nYour responses are being processed.");
    setTimeout(() => {
      setFeedback("Great attempt! Your answers are under review.");
    }, 2000);
  };

  // Handle chat messages
  const handleChatSend = async (e) => {
    e.preventDefault();
    const message = e.target.message.value;
    if (message.trim()) {
      setChatMessages((prev) => [...prev, { text: message, sender: "user" }]);
      e.target.reset();
      try {
        const response = await axios.post("http://localhost:5000/api/auth/selfEvaluation", { query: message });
        const botResponse = response.data;
        setChatMessages((prev) => [
          ...prev,
          {
            text: botResponse.text,
            formulas: botResponse.formulas,
            graphs: botResponse.graphs,
            code: botResponse.code,
            sender: "bot",
          },
        ]);
      } catch (error) {
        console.error("Error in chat:", error);
        setChatMessages((prev) => [
          ...prev,
          { text: "Sorry, I couldn't process your query at this time.", sender: "bot" },
        ]);
      }
    }
  };

  // Render message content (same as before)
  const renderMessageContent = (message) => {
    return (
      <div>
        {/* Render the main explanation text */}
        {message.text && <p style={{ marginBottom: "10px", fontSize: "16px" }}>{message.text}</p>}

        {/* Render LaTeX formulas in a separate block */}
        {message.formulas && message.formulas.length > 0 && (
          <div className="formula-section">
            <h4>📘 Formulas:</h4>
            {message.formulas.map((formula, index) => (
              <div key={index} className="formula-block">
                <Latex>{`$$${formula}$$`}</Latex>
              </div>
            ))}
          </div>
        )}

        {/* Render images in a separate block */}
        {message.graphs && message.graphs.length > 0 && (
          <div className="image-section">
            <h4>🖼️ Visual Explanation:</h4>
            {message.graphs.map((graph, index) => (
              <img
                key={index}
                src={graph}
                alt="Graph"
                style={{ maxWidth: "100%", borderRadius: "10px", marginTop: "5px" }}
              />
            ))}
          </div>
        )}

        {/* Render links in a separate block */}
        {message.links && message.links.length > 0 && (
          <div className="link-section">
            <h4>🔗 Useful Links:</h4>
            {message.links.map((link, index) => (
              <a
                key={index}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#007bff", textDecoration: "none" }}
              >
                {link}
              </a>
            ))}
          </div>
        )}

        {/* Render code blocks in a separate section */}
        {message.code && message.code.length > 0 && (
          <div className="code-section">
            <h4>💻 Code Example:</h4>
            {message.code.map((code, index) => (
              <div key={index} className="code-block">
                <SyntaxHighlighter language={code.language} style={darcula}>
                  {code.content}
                </SyntaxHighlighter>
                <button
                  onClick={() => navigator.clipboard.writeText(code.content)}
                  style={{
                    marginTop: "10px",
                    padding: "5px 10px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Copy Code
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      {/* Left Section: Buttons and Options */}
      <div className="left-section">
        <h2>Self Evaluation</h2>
        <div className="options">
          <button onClick={handleReviewAnswer} className="option-btn">
            Review Your Answer
          </button>
          <button onClick={handleGenerateQuestions} className="option-btn">
            Generate Questions
          </button>
        </div>

        {/* Option 1: Review Your Answer */}
        {selectedOption === 1 && (
          <motion.div className="upload-section" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <h3>Review Your Answer</h3>
            <div
              className="file-upload-container"
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(setUploadedQuestionFile, e.dataTransfer.files[0]);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <label htmlFor="question-upload" className="file-upload-label">
                <span className="upload-icon">📁</span>
                <span className="upload-text">Upload Question File</span>
                <input
                  id="question-upload"
                  type="file"
                  onChange={(e) => handleFileUpload(setUploadedQuestionFile, e.target.files[0])}
                  className="file-input"
                />
              </label>
              {uploadedQuestionFile && (
                <motion.div className="file-preview" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                  <span className="file-name">{uploadedQuestionFile.name}</span>
                  <span className="file-remove" onClick={() => setUploadedQuestionFile(null)}>
                    🗑
                  </span>
                </motion.div>
              )}
            </div>

            <div
              className="file-upload-container"
              onDrop={(e) => {
                e.preventDefault();
                handleFileUpload(setUploadedAnswerFile, e.dataTransfer.files[0]);
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <label htmlFor="answer-upload" className="file-upload-label">
                <span className="upload-icon">📁</span>
                <span className="upload-text">Upload Answer File</span>
                <input
                  id="answer-upload"
                  type="file"
                  onChange={(e) => handleFileUpload(setUploadedAnswerFile, e.target.files[0])}
                  className="file-input"
                />
              </label>
              {uploadedAnswerFile && (
                <motion.div className="file-preview" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                  <span className="file-name">{uploadedAnswerFile.name}</span>
                  <span className="file-remove" onClick={() => setUploadedAnswerFile(null)}>
                    🗑
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Option 2: Generate Questions */}
        {selectedOption === 2 && (
          <motion.div className="upload-section" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
            <h3>Generated Questions</h3>
            {generatedQuestions.map((question, index) => (
              <div key={index} className="question-upload-container">
                <h4>Question {index + 1}: {question}</h4>
                <div
                  className="file-upload-container"
                  onDrop={(e) => {
                    e.preventDefault();
                    const newUploadedAnswers = [...uploadedAnswers];
                    newUploadedAnswers[index] = e.dataTransfer.files[0];
                    setUploadedAnswers(newUploadedAnswers);
                  }}
                  onDragOver={(e) => e.preventDefault()}
                >
                  <label htmlFor={`answer-upload-${index}`} className="file-upload-label">
                    <span className="upload-icon">📁</span>
                    <span className="upload-text">Upload Answer File</span>
                    <input
                      id={`answer-upload-${index}`}
                      type="file"
                      onChange={(e) => {
                        const newUploadedAnswers = [...uploadedAnswers];
                        newUploadedAnswers[index] = e.target.files[0];
                        setUploadedAnswers(newUploadedAnswers);
                      }}
                      className="file-input"
                    />
                  </label>
                  {uploadedAnswers[index] && (
                    <motion.div className="file-preview" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
                      <span className="file-name">{uploadedAnswers[index].name}</span>
                      <span className="file-remove" onClick={() => {
                        const newUploadedAnswers = [...uploadedAnswers];
                        newUploadedAnswers[index] = null;
                        setUploadedAnswers(newUploadedAnswers);
                      }}>
                        🗑
                      </span>
                    </motion.div>
                  )}
                </div>
              </div>
            ))}
            <button onClick={submitGeneratedAnswers} className="submit-btn">
              Submit All Answers
            </button>
          </motion.div>
        )}
      </div>

      {/* Right Section: Chat Bot */}
      <motion.div className="chat-section" initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
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
              {renderMessageContent(msg)}
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