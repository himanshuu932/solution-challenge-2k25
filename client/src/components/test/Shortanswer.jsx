import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../styles/ShortAnswer.css";

const ShortAnswer = ({ setStartTest, questions: initialQuestions = [], testId, onSubmit }) => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState(Array(initialQuestions.length).fill(""));
  const [visited, setVisited] = useState(Array(initialQuestions.length).fill(false));
  const [timeLeft, setTimeLeft] = useState(3000); // 5 minutes
  const [timeTaken, setTimeTaken] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [files, setFiles] = useState(Array(initialQuestions.length).fill(null));
  const [evaluation, setEvaluation] = useState(null);
  const [evaluating, setEvaluating] = useState(false);
  const [currentReview, setCurrentReview] = useState(0);
  const [uploading, setUploading] = useState(false);
  const backend_link = "https://hackblitz-nine.vercel.app";

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

  // Countdown timer effect
  useEffect(() => {
    let timer;
    if (!submitted && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        setTimeTaken((prev) => prev + 1);
      }, 1000);
    }

    return () => clearInterval(timer); // Cleanup on unmount
  }, [submitted, timeLeft]);

  // Auto-submit when time runs out
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

  const handleFileUpload = async (qIndex, file) => {
    if (submitted) return;
  
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "text/plain"];
    const maxSize = 5 * 1024 * 1024;
  
    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, PNG, JPG, and TXT files are allowed.");
      return;
    }
  
    if (file.size > maxSize) {
      alert("File size exceeds the 5MB limit.");
      return;
    }
  
    setUploading(true);
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", userId); // 👈 Include studentId
  
    try {
      const res = await axios.post(`${backend_link}/api/auth/upload-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      const extractedText = res.data.text || "";
  
      const updatedAnswers = [...answers];
      updatedAnswers[qIndex] = extractedText;
      setAnswers(updatedAnswers);
  
      const updatedVisited = [...visited];
      updatedVisited[qIndex] = true;
      setVisited(updatedVisited);
  
      const updatedFiles = [...files];
      updatedFiles[qIndex] = file;
      setFiles(updatedFiles);
    } catch (err) {
      console.error("File upload failed:", err);
      alert("Failed to extract text from file.");
    } finally {
      setUploading(false);
    }
  };
  
  
  

  const handleNextOrSubmit = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleFinalSubmit = async () => {
    setSubmitted(true);

    // Prepare the payload for evaluation
    const updatedAnswers = answers.map((answer) => (answer.trim() === "" ? "Incorrect" : answer));
    const evaluationPayload = questions.map((q, idx) => ({
      questionId: q._id || q.id || idx,
      question: q.question,
      correctAnswer: q.correctAnswer,
      answer: updatedAnswers[idx],
      file: files[idx] ? files[idx].name : null,
    }));

    try {
      setEvaluating(true);

      // Evaluate the answers
      const evaluationResponse = await axios.post(`${backend_link}/api/auth/evaluateShortAnswers`, {
        answers: evaluationPayload,
      });
      setEvaluation(evaluationResponse.data);
      setEvaluating(false);
      setCurrentReview(0);

      console.log("this is the time taken: "+ timeTaken);

      // Prepare the payload for saving test details
      const totalScore = evaluationResponse.data.totalScore;
      const testDetailsPayload = {
        userId,
        testId,
        status: "attempted",
        score: totalScore,
        totalQuestions: questions.length,
        correctAnswers: totalScore, // Assuming totalScore is the number of correct answers
        incorrectAnswers: questions.length - totalScore,
        time: timeTaken,
        answers: questions.map((q, idx) => ({
          questionId: q._id || q.id || idx,
          answerText: answers[idx],
          isCorrect: answers[idx].trim() !== "", // Example logic for correctness
        })),
      };



      try{
        await axios.post(`${backend_link}/api/auth/test-details`, testDetailsPayload);
        console.log("Test attempt saved successfully");

        const cleanedTestId = testId?.trim();

  
        await axios.post(`${backend_link}/api/auth/tests/${cleanedTestId}/attempt`, {
          studentId: userId,
        });
        
      }catch(error){
        console.error('Error saving test attempt:', error);
      }

      // Save test details
     

      // Call the onSubmit callback if provided
      if (onSubmit) {
        onSubmit(totalScore);
      }
    } catch (error) {
      console.error("Error during evaluation or saving test details:", error);
      setEvaluating(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="quiz-container">
      <Sidebar
        questions={questions}
        answers={answers}
        visited={visited}
        submitted={submitted}
        currentQ={currentQ}
        currentReview={currentReview}
        setCurrentQ={setCurrentQ}
        setCurrentReview={setCurrentReview}
        handleFinalSubmit={handleFinalSubmit}
        setStartTest={setStartTest}
      />
      <div className="main-content">
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
                disabled={submitted || uploading}
              />
              <label htmlFor={`file-upload-${currentQ}`} className="file-upload-label">
                {uploading ? "Uploading..." : "Upload File (Text, PDF, Image)"}
              </label>
              {files[currentQ] && <p>Uploaded: {files[currentQ].name}</p>}
            </div>
            <button className="next-submit-button" onClick={handleNextOrSubmit}>
              {currentQ === questions.length - 1 ? "Submit" : "Next"}
            </button>
          </div>
        ) : (
          <Results
            evaluation={evaluation}
            evaluating={evaluating}
            questions={questions}
            answers={answers}
            files={files}
            currentReview={currentReview}
            setCurrentReview={setCurrentReview}
          />
        )}
      </div>
    </div>
  );
};

const Sidebar = ({ questions, answers, visited, submitted, currentQ, currentReview, setCurrentQ, setCurrentReview, handleFinalSubmit, setStartTest }) => (
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
);

const Results = ({ evaluation, evaluating, questions, answers, files, currentReview, setCurrentReview }) => (
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
);

export default ShortAnswer;