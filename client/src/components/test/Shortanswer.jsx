import React, { useState, useEffect } from "react";
import "../styles/ShortAnswer.css";

const ShortAnswer = ({ questions: initialQuestions = [] }) => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(questions.length).fill(""));
  const [visited, setVisited] = useState(Array(questions.length).fill(false));
  const [timeLeft, setTimeLeft] = useState(300); // 5-minute timer
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState(Array(questions.length).fill(null));

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

  const handleAnswerChange = (qIndex, value) => {
    if (submitted) return;
    const updatedAnswers = [...answers];
    updatedAnswers[qIndex] = value;
    setAnswers(updatedAnswers);

    const updatedVisited = [...visited];
    updatedVisited[qIndex] = true;
    setVisited(updatedVisited);
  };

  const handleFileUpload = (qIndex, file) => {
    if (submitted) return;
    const updatedFiles = [...files];
    updatedFiles[qIndex] = file;
    setFiles(updatedFiles);
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
    // Here you can handle the submission of answers and files
    console.log("Answers:", answers);
    console.log("Files:", files);
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
                  ? answers[idx] === ""
                    ? "not-answered"
                    : "answered"
                  : answers[idx] !== ""
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
          <p>Answered: {answers.filter((a) => a !== "").length}</p>
          <p>Not Answered: {answers.filter((a) => a === "").length}</p>
          <p>Visited: {visited.filter((v) => v).length}</p>
        </div>
      </div>

      <div className="main-content">
        <div className="timer">Time Left: {formatTime(timeLeft)}</div>
        <div className="question-block">
          <h3>Question {currentQ + 1}: {questions[currentQ]?.question}</h3>
          <textarea
            className="answer-textarea"
            placeholder="Type your answer here..."
            value={answers[currentQ]}
            onChange={(e) => handleAnswerChange(currentQ, e.target.value)}
            disabled={submitted}
          />
          <div className="file-upload">
            <input
              type="file"
              id="file-upload"
              onChange={(e) => handleFileUpload(currentQ, e.target.files[0])}
              disabled={submitted}
            />
            <label htmlFor="file-upload" className="file-upload-label">
              Upload File (Text, PDF, Image)
            </label>
            {files[currentQ] && <p>Uploaded: {files[currentQ].name}</p>}
          </div>
          {!submitted && (
            <button className="next-submit-button" onClick={handleNextOrSubmit}>
              {currentQ === questions.length - 1
                ? "Final Submit"
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

export default ShortAnswer;