import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "./styles/SelfEvaluation.css";
import Latex from "react-latex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { darcula } from "react-syntax-highlighter/dist/esm/styles/prism";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import FileUploadEvaluation from "./fileuploadevaluate";

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
  const [performanceData, setPerformanceData] = useState([]);
  const [loadingPerformance, setLoadingPerformance] = useState(true);
  const [activeTab, setActiveTab] = useState("evaluation");
  const [isListening, setIsListening] = useState(false);
  const [micError, setMicError] = useState(null);
  const [isPdfSectionPinned, setIsPdfSectionPinned] = useState(true);
  const [questionFile, setQuestionFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [extractedQuestionsText, setExtractedQuestionsText] = useState("");
  const [extractedAnswersText, setExtractedAnswersText] = useState("");
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [confirmEvaluation, setConfirmEvaluation] = useState(false);
  const chatInputRef = useRef(null);
  const [showOverlay, setShowOverlay] = useState(false);


  const backend_link = "https://hackblitz-nine.vercel.app";

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  useEffect(() => {
    if (chatInputRef.current && transcript) {
      chatInputRef.current.value = transcript;
    }
  }, [transcript]);

  const toggleListening = async () => {
    try {
      if (isListening) {
        await SpeechRecognition.stopListening();
        setIsListening(false);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop());
        await SpeechRecognition.startListening({
          continuous: true,
          language: "en-US",
        });
        setIsListening(true);
        setMicError(null);
      }
    } catch (error) {
      console.error("Microphone error:", error);
      setMicError(
        "Microphone access denied. Please allow microphone permissions."
      );
      setIsListening(false);
    }
  };

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

  const questions = [
    "Explain SDG4 in one sentence?",
    "Describe the impact of quality education?",
    "How can education help in sustainable development?",
    "Write an essay on SDG4.",
  ];

  useEffect(() => {
    if (userId) {
      fetchPerformanceData();
    }
  }, [userId]);

  const fetchPerformanceData = async () => {
    try {
      setLoadingPerformance(true);
      const response = await axios.get(
        `${backend_link}/api/auth/performance/${userId}`
      );
      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
        ? response.data
        : [];
      setPerformanceData(data);
    } catch (error) {
      console.error("Error fetching performance data:", error);
      setPerformanceData([]);
    } finally {
      setLoadingPerformance(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) {
      setFeedback("Please enter an answer before submitting.");
      return;
    }
    setFeedback("Evaluating...\nYour response is being processed.");
    try {
      const response = await axios.post(
        `${backend_link}/api/auth/evaluate-answer`,
        {
          userId,
          question: questions[selectedQuestionNumber - 1],
          answer,
          questionNumber: selectedQuestionNumber,
        }
      );
      setFeedback(response.data.feedback);
      const newAnswers = [...answers];
      newAnswers[selectedQuestionNumber - 1] = "answered";
      setAnswers(newAnswers);
      fetchPerformanceData();
    } catch (error) {
      console.error("Error evaluating answer:", error);
      setFeedback("Error evaluating your answer. Please try again.");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }
    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", userId);
    try {
      const response = await axios.post(
        `${backend_link}/api/auth/upload-pdf`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.data.success) {
        setUploadStatus("File uploaded and processed successfully!");
        setExtractedText(response.data.text);
      } else {
        setUploadStatus("Failed to process file.");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadStatus("Failed to upload file.");
    } finally {
      setIsUploading(false);
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
      resetTranscript();
      e.target.reset();
      setIsChatLoading(true);
      try {
        const fullPrompt = extractedText
          ? `${extractedText}\n\nUser Query: ${message}`
          : message;
        const response = await axios.post(
          `${backend_link}/api/auth/selfEvaluation`,
          {
            query: fullPrompt,
          }
        );
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
          {
            text: "Sorry, I couldn't process your query at this time.",
            sender: "bot",
          },
        ]);
      } finally {
        setIsChatLoading(false);
      }
    }
  };

  const cleanMessageText = (text) => {
    if (!text) return "";
    text = text

      .replace(/### \*\*Response:?\*\*/g, "")

      .replace(/\*\*Explanation:\*\*/g, "")

      .replace(/\*\*Formulas \(if applicable\):\*\*/g, "")

      .replace(/\*\*Images \(if applicable\):\*\*/g, "")

      .replace(/\*\*Links \(if applicable\):\*\*/g, "")

      .replace(/\*\*Code \(if applicable\):\*\*/g, "")

      .trim(); // Remove extra spaces

    // Convert URLs into clickable links

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: "#007bff",
            textDecoration: "underline",
            fontWeight: "bold",
          }}
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  const renderMessageContent = (message) => {
    return (
      <div>
        {message.text && (
          <p style={{ marginBottom: "10px", fontSize: "16px" }}>
            {cleanMessageText(message.text)}
          </p>
        )}
        {message.formulas && message.formulas.length > 0 && (
          <div className="formula-section">
            {message.formulas.map((formula, index) => (
              <div key={index} className="formula-block">
                <Latex>{`$$${formula}$$`}</Latex>
              </div>
            ))}
          </div>
        )}
        {message.graphs &&
          message.graphs.length > 0 &&
          message.graphs.map((graph, index) => (
            <img
              key={index}
              src={graph}
              alt="Graph"
              style={{
                maxWidth: "100%",
                borderRadius: "10px",
                marginTop: "5px",
              }}
            />
          ))}
        {message.code &&
          message.code.length > 0 &&
          message.code.map((code, index) => (
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
    );
  };

  const formatTime = (seconds) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Your browser doesn't support speech recognition.</span>;
  }

  const toggleOverlay = () => {
    setShowOverlay(!showOverlay);
  };

  return (
    <div className="container">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "evaluation" ? "active" : ""}`}
          onClick={() => setActiveTab("evaluation")}
        >
          Self Evaluation
        </button>
        <button
          className={`tab-button ${
            activeTab === "performance" ? "active" : ""
          }`}
          onClick={() => setActiveTab("performance")}
        >
          My Performance
        </button>
      </div>

      {activeTab === "evaluation" ? (
        <>
          {showOverlay && (
            <div className="overlay-container">
              <div className="overlay-content">
                <button className="overlay-close-btn" onClick={toggleOverlay}>
                  ✕
                </button>
                <motion.div
                  className="upload-section"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2>Upload Answer</h2>
                  <select
                    value={selectedQuestionNumber}
                    onChange={(e) =>
                      setSelectedQuestionNumber(parseInt(e.target.value))
                    }
                  >
                    {questions.map((q, index) => (
                      <option key={index} value={index + 1}>
                        Question {index + 1}: {q.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                  <textarea
                    className="answer-textarea"
                    placeholder="Type your answer..."
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                  <div className="file-upload-container">
                    <label htmlFor="file-upload" className="file-upload-label">
                      <span>📁</span>
                      <span>Choose a file</span>
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
                        <span
                          className="file-remove"
                          onClick={() => setImage(null)}
                        >
                          🗑
                        </span>
                      </motion.div>
                    )}
                  </div>
                  <button className="submit-answer-btn" onClick={submitAnswer}>
                    Submit Answer
                  </button>
                  {feedback && (
                    <div className="feedback-container">
                      <h3 className="feedback-title">Feedback:</h3>
                      <p>{feedback}</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          )}

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
                  {renderMessageContent(msg)}
                </motion.div>
              ))}
            </div>

            <div className="pdf-section-header">
              <h2>Upload PDF File</h2>
              <button
                onClick={() => setIsPdfSectionPinned(!isPdfSectionPinned)}
                className={`pdf-section-toggle ${
                  isPdfSectionPinned ? "pinned" : ""
                }`}
                title={
                  isPdfSectionPinned ? "Hide PDF section" : "Show PDF section"
                }
              >
                +
              </button>
            </div>

            {isPdfSectionPinned && <FileUploadEvaluation userId={userId} />}

            <form onSubmit={handleChatSend} className="chat-input-container">
              <button
                type="button"
                onClick={toggleOverlay}
                className="overlay-toggle-btn"
                title="Open answer form"
              >
                ✎
              </button>
              <input
                type="text"
                name="message"
                placeholder="Type a message..."
                required
                ref={chatInputRef}
                className="chat-input-field"
              />
              <button
                type="button"
                onClick={toggleListening}
                className={`voice-btn ${isListening ? "listening" : ""}`}
                title={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? "🛑" : "🎤"}
              </button>
              <button
                type="submit"
                disabled={isChatLoading}
                className="send-btn"
              >
                {isChatLoading ? "Sending..." : "Send"}
              </button>
            </form>
          </motion.div>
        </>
      ) : (
        <motion.div
          className="performance-section"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2>Your Previous Test's Performance History</h2>
          {loadingPerformance ? (
            <div className="loading-indicator">
              Loading your performance data...
            </div>
          ) : (
            <>
              {!performanceData || performanceData.length === 0 ? (
                <div className="no-data">No performance data available yet</div>
              ) : (
                <div className="performance-cards">
                  {performanceData.map((test, index) => {
                    const testName = test.testName || `Test ${index + 1}`;
                    const testTopic = test.topic;
                    const score = test.score || 0;
                    const correctAnswers = test.correctAnswers || 0;
                    const totalQuestions = test.totalQuestions || 1;
                    const timeTaken = test.timeTaken || 0;
                    const attemptedAt = test.attemptedAt
                      ? new Date(test.attemptedAt)
                      : new Date();
                    return (
                      <motion.div
                        key={index}
                        className="performance-card"
                        whileHover={{ scale: 1.02 }}
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 10,
                        }}
                      >
                        <h3>{testName}</h3>
                        <div className="performance-metrics">
                          <div className="metric">
                            <span className="metric-label">Topic:</span>
                            <span className="metric-value">{testTopic}</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Score:</span>
                            <span className="metric-value">{score}%</span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Correct:</span>
                            <span className="metric-value">
                              {correctAnswers}/{totalQuestions}
                            </span>
                          </div>
                          <div className="metric">
                            <span className="metric-label">Time Taken:</span>
                            <span className="metric-value">
                              {formatTime(timeTaken)}
                            </span>
                          </div>
                        </div>
                        <div className="performance-date">
                          Attempted on: {attemptedAt.toLocaleDateString()}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
