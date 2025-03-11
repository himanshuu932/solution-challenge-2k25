import React, { useState, useEffect } from "react";
import "../styles/MCQQuiz.css";

const MCQQuiz = ({ setStartTest, questions: initialQuestions = [] }) => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(initialQuestions.length).fill(null));
  const [visited, setVisited] = useState(Array(initialQuestions.length).fill(false));
  const [timeLeft, setTimeLeft] = useState(15); // For demonstration, 15 seconds (adjust as needed)
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [currentReview, setCurrentReview] = useState(0);

  useEffect(() => {
    console.log("Questions:", questions);
  }, [questions]);

  // Timer effect: decrement timeLeft every second until 0.
  useEffect(() => {
    if (submitted || timeLeft === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // Auto-submit the test when time runs out.
  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      handleFinalSubmit();
    }
  }, [timeLeft, submitted]);

  // Removed auto-submission when all questions answered

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

  const handleFinalSubmit = () => {
    setSubmitted(true);
    calculateScore();
    setCurrentReview(0);
    // Timer stops automatically because the timer effect no longer runs when submitted is true.
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (questions[index].options[answer]?.label === questions[index].correctAnswer) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="quiz-container">
      <div className="sidebar">
        <div className="sidebar-title">Questions</div>
        <div className="question-nav">
          {questions.map((q, idx) => (
            <div
              key={idx}
              className={`question-box ${
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
              }`}
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
        <div className="status-bar">
          <p>Answered: {answers.filter((a) => a !== null).length}</p>
          <p>Not Answered: {answers.filter((a) => a === null).length}</p>
          <p>Visited: {visited.filter((v) => v).length}</p>
        </div>
        <div className="end-test-container">
          {!submitted && (
            <button className="end-test-button" onClick={handleFinalSubmit}>
              End Test
            </button>
          )}
          {submitted && (
            <button className="end-test-button" onClick={() => setStartTest(false)}>
              Close Test
            </button>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="timer">Time Left: {formatTime(timeLeft)}</div>
        {!submitted ? (
          <div className="question-block">
            <h3>
              Question {currentQ + 1}: {questions[currentQ]?.question}
            </h3>
            <div className="options-container">
              {questions[currentQ]?.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`option-button ${answers[currentQ] === idx ? "selected" : ""}`}
                  onClick={() => handleOptionClick(currentQ, idx)}
                >
                  {opt.text}
                </button>
              ))}
            </div>
            <button
              className="next-submit-button"
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
          <div className="results">
            <div className="score">
              <strong>Your Score:</strong> {score} / {questions.length}
            </div>
            <div className="question-result">
              <h4>
                Question {currentReview + 1}: {questions[currentReview].question}
              </h4>
              <div className="options-result">
                {questions[currentReview].options.map((opt, oIdx) => (
                  <div
                    key={oIdx}
                    className={`option-result ${
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
              <div className="explanation">
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
            <div className="navigation-buttons">
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
