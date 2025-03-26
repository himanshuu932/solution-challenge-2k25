import { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./styles/SelfEvaluation.css";
import Latex from 'react-latex';
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";

export default function SelfEvaluation() {
  const [question, setQuestion] = useState("Select a question");
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedQuestionNumber, setSelectedQuestionNumber] = useState(1);
  const [visited, setVisited] = useState(Array(4).fill(false));
  const [answers, setAnswers] = useState(Array(4).fill(null));
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [image, setImage] = useState(null);

let userId = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (err) {
      console.error("Error decoding token", err);
    }
  }

  console.log("this is the user id "+userId);

  const questions = [
    "Explain SDG4 in one sentence?",
    "Describe the impact of quality education?",
    "How can education help in sustainable development?",
    "Write an essay on SDG4.",
  ];




  const submitAnswer = () => {

    setFeedback("Evaluating...\nYour response is being processed.");

    setTimeout(() => {

      setFeedback(

        "Great attempt! Try to elaborate more on key points.\nIdeal answer: SDG4 focuses on ensuring inclusive and equitable quality education."

      );

      const newAnswers = [...answers];

      newAnswers[selectedQuestionNumber - 1] = "answered";

      setAnswers(newAnswers);

    }, 2000);

  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
  
    // Validate file type
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
  
    setIsUploading(true); // Set loading state
    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", userId); // Append studentId to the FormData
  
    try {
      const response = await axios.post("http://localhost:5000/api/auth/upload-pdf", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
  
      if (response.data.success) {
        setUploadStatus("File uploaded and processed successfully!");
        setExtractedText(response.data.text); // Store the extracted text
        console.log("Extracted text:", response.data.text);
      } else {
        setUploadStatus("Failed to process file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("Failed to upload file.");
    } finally {
      setIsUploading(false); // Reset loading state
    }
  };

  const handleClearFile = () => {
    setFile(null);
    setUploadStatus("");
    setExtractedText("");
  };

  const handleChatSend = async (e) => {
    e.preventDefault();
    const message = e.target.message.value;
  
    if (message.trim()) {
      setChatMessages((prev) => [...prev, { text: message, sender: "user" }]);
      e.target.reset();
      setIsChatLoading(true); // Set loading state
  
      try {
        // Combine the extracted text with the user's message
        const fullPrompt = extractedText ? `${extractedText}\n\nUser Query: ${message}` : message;
  
        const response = await axios.post("http://localhost:5000/api/auth/selfEvaluation", {
          query: fullPrompt, // Send the combined prompt to the backend
        });
  
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
      } finally {
        setIsChatLoading(false); // Reset loading state
      }
    }
  };

  const renderMessageContent = (message) => {
    return (
      <div>
        {message.text && <p style={{ marginBottom: "10px", fontSize: "16px" }}>{message.text}</p>}
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
      <div className="right-section">
        <motion.div className="upload-section" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
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
              <motion.div className="file-preview" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
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

        <div className="file-upload-section">
          <h2>Upload PDF File</h2>
          <form onSubmit={handleFileUpload}>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <button type="submit" disabled={isUploading}>
              {isUploading ? "Uploading..." : "Upload"}
            </button>
            {file && (
              <button onClick={handleClearFile} className="clear-btn">
                Clear File
              </button>
            )}
          </form>
          {uploadStatus && <p>{uploadStatus}</p>}
        </div>

        <form onSubmit={handleChatSend} className="chat-input">
          <input type="text" name="message" placeholder="Type a message..." required />
          <button type="submit" disabled={isChatLoading}>
            {isChatLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}