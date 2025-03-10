import React, { useState, useEffect } from "react";
import "../styles/MCQQuiz.css";

const MCQQuiz = ({ questions: initialQuestions = [] }) => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [visited, setVisited] = useState(Array(questions.length).fill(false));
  const [timeLeft, setTimeLeft] = useState(300); // 5-minute timer
  const [submitted, setSubmitted] = useState(false);

  // Log the questions to verify the data structure
  useEffect(() => {
    console.log("Questions:", questions);
  }, [questions]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      if (timeLeft === 0) handleFinalSubmit();
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

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
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = () => {
    setSubmitted(true);
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
                    : answers[idx] === q.correct
                    ? "correct"
                    : "incorrect"
                  : answers[idx] !== null
                  ? "answered"
                  : visited[idx]
                  ? "visited"
                  : "not-visited"
              }`}
              onClick={() => setCurrentQ(idx)}
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
      </div>

      <div className="main-content">
        <div className="timer">Time Left: {formatTime(timeLeft)}</div>
        <div className="question-block">
          {/* Render the question text using the `question` property */}
          <h3>Question {currentQ + 1}: {questions[currentQ]?.question}</h3>
          <div className="options-container">
            {questions[currentQ]?.options.map((opt, idx) => (
              <button
                key={idx}
                className={`option-button ${
                  submitted
                    ? idx === questions[currentQ].correct
                      ? "correct"
                      : answers[currentQ] === idx
                      ? "incorrect"
                      : ""
                    : answers[currentQ] === idx
                    ? "selected"
                    : ""
                }`}
                onClick={() => handleOptionClick(currentQ, idx)}
              >
                {opt.text} {/* Render the `text` property of the option object */}
              </button>
            ))}
          </div>
          {!submitted && (
            <button className="next-submit-button" onClick={handleNextOrSubmit}>
              {currentQ === questions.length - 1
                ? "Final Submit"
                : answers[currentQ] !== null
                ? "Submit"
                : "Next"}
            </button>
          )}
          {submitted && (
            <div className="explanation">
              <strong>Explanation:</strong> {questions[currentQ]?.explanation}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MCQQuiz;