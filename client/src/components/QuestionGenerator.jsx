import React, { useState } from "react";
import axios from "axios";
import "./styles/QuestionGenerator.css";

function QuestionGenerator() {
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("multiple-choice");
  const [level, setLevel] = useState("");
  const [Number, setNumber] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const backend_link = "https://hackblitz-nine.vercel.app";

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${backend_link}/api/auth/generate-questions`, {
        topic,
        type,
        level,
        Number,
      });

      // Handle both single question and array of questions
      if (response.data && response.data.question) {
        // If the response contains a single question object
        setQuestions([response.data]); // Wrap the single question in an array
      } else if (response.data && Array.isArray(response.data.questions)) {
        // If the response contains an array of questions
        setQuestions(response.data.questions);
      } else {
        setError("Invalid response format from the server.");
      }
    } catch (err) {
      setError("Failed to fetch questions. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  const renderQuestion = (question) => {
    if (!question) return null;

    return (
      <div key={question.question} className="question-card">
        <h3>{question.question}</h3>
        {question.options && (
          <ul className="options-list">
            {question.options.map((option, index) => (
              <li key={index}>
                <strong>{option.label}:</strong> {option.text}
              </li>
            ))}
          </ul>
        )}
        <div className="correct-answer">
          <strong>Correct Answer:</strong> {question.correctAnswer}
        </div>
        <div className="explanation">
          <strong>Explanation:</strong> {question.explanation?.correct || "No explanation provided."}
        </div>
        <div className="metadata">
          <p><strong>Topic:</strong> {question.metadata?.topic || "N/A"}</p>
          <p><strong>Difficulty:</strong> {question.metadata?.difficulty || "N/A"}</p>
          <p><strong>Type:</strong> {question.metadata?.questionType || "N/A"}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="question-generator-container">
      <h2 className="title">Generate Questions</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="multiple-choice">Multiple Choice</option>
          <option value="short-answer">Short Answer</option>
          <option value="long-answer">Long Answer</option>
        </select>
        <input
          type="text"
          placeholder="Enter class/level"
          value={level}
          onChange={(e) => setLevel(e.target.value)}
        />
        <input
          type="text"
          placeholder="Number of questions"
          value={Number}
          onChange={(e) => setNumber(e.target.value)}
        />
      </div>
      <button className="generate-btn" onClick={fetchQuestions} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>
      {error && <p className="error-message">{error}</p>}
      <div className="questions-list">
        {questions.length > 0 ? (
          questions.map((question, index) => renderQuestion(question))
        ) : (
          <p>No questions generated yet.</p>
        )}
      </div>
    </div>
  );
}

export default QuestionGenerator;