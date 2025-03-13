import React, { useState, useEffect } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import "../styles/MCQQuiz.css";

const MCQQuiz = ({ setStartTest, questions: initialQuestions = [], testId, onSubmit }) => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(initialQuestions.length).fill(null));
  const [visited, setVisited] = useState(Array(initialQuestions.length).fill(false));
  const [timeLeft, setTimeLeft] = useState(15); // seconds for demo
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentReview, setCurrentReview] = useState(0);

  // Get user id from token stored in localStorage
  let userId = null;
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.id;
    } catch (err) {
      console.error("Error decoding token", err);
    }
  }

  useEffect(() => {
    console.log("Questions:", questions);
  }, [questions]);

  // Countdown timer effect
  useEffect(() => {
    if (submitted || timeLeft === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // Auto-submit when time runs out
  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      handleFinalSubmit();
    }
  }, [timeLeft, submitted]);

  const handleOptionClick = (qIndex, oIndex) => {
    if (submitted) return;
    const updatedAnswers = [...answers];
    updatedAnswers[qIndex] = oIndex;
    setAnswers(updatedAnswers);

    const updatedVisited = [...visited];
    updatedVisited[qIndex] = true;
    setVisited(updatedVisited);
  };

  const handleNextOrSubmit = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    }
  };

  // When the test is submitted, calculate score and update test details for the user
  const handleFinalSubmit = async () => {
    setSubmitted(true);
    const calculatedScore = calculateScore();
    setScore(calculatedScore);
    setCurrentReview(0);

    try {
      await axios.post("/api/auth/test-details", {
        userId,
        testId,
        status: "attempted",
        score: calculatedScore,
        attemptedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating test details", error);
    }
    
    if (onSubmit) onSubmit(calculatedScore);
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (questions[index].options[answer]?.label === questions[index].correctAnswer) {
        correctAnswers++;
      }
    });
    return correctAnswers;
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="mcq-quiz-container">
      {/* Sidebar and navigation (omitted for brevity) */}
      <div className="mcq-sidebar">
        <div className="mcq-sidebar-title">Questions</div>
        <div className="mcq-question-nav">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className={`mcq-question-box ${
                submitted
                  ? answers[idx] === null
                    ? "not-answered"
                    : questions[idx].options[answers[idx]]?.label === questions[idx].correctAnswer
                    ? "correct"
                    : "incorrect"
                  : answers[idx] !== null
                  ? "answered"
                  : visited[idx]
                  ? "visited"
                  : "not-visited"
              } ${currentQ === idx ? "active" : ""}`}
              onClick={() => {
                if (!submitted) {
                  setCurrentQ(idx);
                } else {
                  setCurrentReview(idx);
                }
              }}
            >
              {idx + 1}
            </div>
          ))}
        </div>
        <div className="mcq-status-bar">
          <p>Answered: {answers.filter((a) => a !== null).length}</p>
          <p>Not Answered: {answers.filter((a) => a === null).length}</p>
          <p>Visited: {visited.filter((v) => v).length}</p>
        </div>
        <div className="mcq-end-test-container">
          {!submitted && (
            <button className="mcq-end-test-button" onClick={handleFinalSubmit}>
              End Test
            </button>
          )}
          {submitted && (
            <button className="mcq-end-test-button close" onClick={() => setStartTest(false)}>
              Close Test
            </button>
          )}
        </div>
      </div>
      <div className="mcq-main-content">
        <div className="mcq-timer">Time Left: {formatTime(timeLeft)}</div>
        {!submitted ? (
          <div className="mcq-question-block">
            <h3>
              Question {currentQ + 1}: {questions[currentQ]?.question}
            </h3>
            <div className="mcq-options-container">
              {questions[currentQ]?.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`mcq-option-button ${answers[currentQ] === idx ? "selected" : ""}`}
                  onClick={() => handleOptionClick(currentQ, idx)}
                >
                  {opt.text}
                </button>
              ))}
            </div>
            <button
              className="mcq-next-submit-button"
              onClick={() => {
                if (currentQ === questions.length - 1) {
                  handleFinalSubmit();
                } else {
                  handleNextOrSubmit();
                }
              }}
            >
              {currentQ === questions.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        ) : (
          <div className="mcq-results">
          <div className="mcq-score">
            <strong>Your Score:</strong> {score} / {questions.length}
          </div>
          <div className="mcq-question-result">
            <h4>
              Question {currentReview + 1}: {questions[currentReview].question}
            </h4>
            <div className="mcq-options-result">
              {questions[currentReview].options.map((opt, oIdx) => (
                <div
                  key={oIdx}
                  className={`mcq-option-result ${
                    opt.label === questions[currentReview].correctAnswer
                      ? "correct"
                      : answers[currentReview] === oIdx
                      ? "incorrect"
                      : ""
                  }`}
                >
                  {opt.text}
                </div>
              ))}
            </div>
            <div className="mcq-explanation">
              <strong>Explanation:</strong>{" "}
              {questions[currentReview].explanation &&
              typeof questions[currentReview].explanation === "object" ? (
                <ul>
                  {Object.entries(questions[currentReview].explanation).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key.toUpperCase()}:</strong> {value}
                    </li>
                  ))}
                </ul>
              ) : (
                questions[currentReview].explanation
              )}
            </div>
          </div>
          <div className="mcq-navigation-buttons">
            <button onClick={() => setCurrentReview((prev) => prev - 1)} disabled={currentReview === 0}>
              Previous
            </button>
            <button
              onClick={() => setCurrentReview((prev) => prev + 1)}
              disabled={currentReview === questions.length - 1}
            >
              Next
            </button>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default MCQQuiz;
