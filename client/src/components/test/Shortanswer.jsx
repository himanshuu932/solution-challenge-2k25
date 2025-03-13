import React, { useState, useEffect } from "react";
import axios from "axios";
import {jwtDecode} from "jwt-decode";
import "../styles/ShortAnswer.css";

const ShortAnswer = ({ setStartTest, questions: initialQuestions = [], testId, onSubmit }) => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(initialQuestions.length).fill(""));
  const [visited, setVisited] = useState(Array(initialQuestions.length).fill(false));
  const [timeLeft, setTimeLeft] = useState(30); // 5 minutes
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState(Array(initialQuestions.length).fill(null));
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);

  // Get user id from token stored in localStorage
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

  useEffect(() => {
    console.log("Questions:", questions);
  }, [questions]);

  // Countdown timer effect - similar to MCQQuiz implementation
  useEffect(() => {
    if (submitted || timeLeft === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, submitted]);

  // Auto-submit when time runs out - similar to MCQQuiz implementation
  useEffect(() => {
    if (timeLeft === 0 && !submitted) {
      handleFinalSubmit();
    }
  }, [timeLeft, submitted]);

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

  // When the test is submitted, evaluate and update test details for the user
  const handleFinalSubmit = async () => {
    setSubmitted(true);
    const updatedAnswers = answers.map((answer) => (answer.trim() === "" ? "Incorrect" : answer));
    const payload = questions.map((q, idx) => ({
      questionId: q._id || q.id || idx,
      question: q.question,
      correctAnswer: q.correctAnswer,
      answer: updatedAnswers[idx],
      file: files[idx] ? files[idx].name : null,
    }));

    try {
      setEvaluating(true);
      const response = await axios.post("http://localhost:5000/api/auth/evaluateShortAnswers", { answers: payload });
      setEvaluation(response.data);
      setEvaluating(false);
      setCurrentReview(0);

      // After evaluation, update test details for the user with the total score
      const totalScore = response.data.totalScore;
      await axios.post("/api/auth/test-details", {
        userId,
        testId,
        status: "attempted",
        score: totalScore,
        attemptedAt: new Date(),
      });
      
      if (onSubmit) onSubmit(totalScore);
    } catch (error) {
      console.error("Evaluation error:", error);
      setEvaluating(false);
    }
  };

  // Format time function - identical to MCQQuiz implementation
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
                  ? answers[idx] === "" ? "not-answered" : "answered"
                  : answers[idx] !== "" ? "answered" : visited[idx] ? "visited" : "not-visited"
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
        <div className="status-bar">
          <p>Answered: {answers.filter((a) => a !== "").length}</p>
          <p>Not Answered: {answers.filter((a) => a === "").length}</p>
          <p>Visited: {visited.filter((v) => v).length}</p>
        </div>
        <div className="end-test-container">
          {!submitted ? (
            <button className="end-test-button" onClick={handleFinalSubmit}>
              End Test
            </button>
          ) : (
            <button className="end-test-button close" onClick={() => setStartTest(false)}>
              Close Test
            </button>
          )}
        </div>
      </div>
      <div className="main-content">
        {/* Timer moved to top of main content area like in MCQQuiz */}
        <div className="mcq-timer">Time Left: {formatTime(timeLeft)}</div>
        {!submitted ? (
          <div className="question-block">
            <h3>
              Question {currentQ + 1}: {questions[currentQ]?.question}
            </h3>
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
                id={`file-upload-${currentQ}`}
                onChange={(e) => handleFileUpload(currentQ, e.target.files[0])}
                disabled={submitted}
              />
              <label htmlFor={`file-upload-${currentQ}`} className="file-upload-label">
                Upload File (Text, PDF, Image)
              </label>
              {files[currentQ] && <p>Uploaded: {files[currentQ].name}</p>}
            </div>
            <button className="next-submit-button" onClick={handleNextOrSubmit}>
              {currentQ === questions.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        ) : (
          <div className="results">
            {evaluating ? (
              <p>Evaluating your answers, please wait...</p>
            ) : evaluation ? (
              <>
                <div className="score">
                  <strong>Your Score:</strong> {evaluation.totalScore} / {questions.length}
                </div>
                <div className="question-result">
                  <h4>
                    Question {currentReview + 1}: {questions[currentReview].question}
                  </h4>
                  <div className="answer-result">
                    <p>
                      <strong>Your Answer:</strong> {answers[currentReview]}
                    </p>
                    {files[currentReview] && (
                      <p>
                        <strong>Uploaded File:</strong> {files[currentReview].name}
                      </p>
                    )}
                  </div>
                  {evaluation.evaluations && evaluation.evaluations[currentReview] && (
                    <div className="evaluation-result">
                      <p>
                        <strong>Score:</strong> {evaluation.evaluations[currentReview].score}
                      </p>
                      <p>
                        <strong>Remarks:</strong> {evaluation.evaluations[currentReview].remarks}
                      </p>
                      {evaluation.evaluations[currentReview].metrics &&
                        Object.keys(evaluation.evaluations[currentReview].metrics).length > 0 && (
                          <div className="evaluation-metrics">
                            <h5>Metrics:</h5>
                            <ul>
                              {Object.entries(evaluation.evaluations[currentReview].metrics).map(([param, value]) => (
                                <li key={param}>
                                  <strong>{param.charAt(0).toUpperCase() + param.slice(1)}:</strong> {value}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>
                  )}
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
              </>
            ) : (
              <p>No evaluation data available.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortAnswer;