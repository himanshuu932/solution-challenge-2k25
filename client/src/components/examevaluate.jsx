import React, { useState } from "react";
import axios from "axios";
import './styles/examevaluate.css';

const Evaluate = ({ teacherId }) => {
  const [questionFile, setQuestionFile] = useState(null);
  const [studentAnswerFile, setStudentAnswerFile] = useState(null);
  const [correctAnswerFile, setCorrectAnswerFile] = useState(null);
  const [questionText, setQuestionText] = useState("");
  const [studentAnswerText, setStudentAnswerText] = useState("");
  const [correctAnswerText, setCorrectAnswerText] = useState("");
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEvaluate = async () => {
    // Check if at least one input method is provided for each field (file or text)
    if (
      (!questionFile && !questionText) ||
      (!studentAnswerFile && !studentAnswerText) ||
      (!correctAnswerFile && !correctAnswerText)
    ) {
      alert("Please provide all required inputs: question, student answer, and correct answer (either as text or files).");
      return;
    }

    const formData = new FormData();

    // Append files if they exist
    if (questionFile) formData.append("questionFile", questionFile);
    if (studentAnswerFile) formData.append("studentAnswerFile", studentAnswerFile);
    if (correctAnswerFile) formData.append("correctAnswerFile", correctAnswerFile);

    // Append text inputs if they exist
    if (questionText) formData.append("questionText", questionText);
    if (studentAnswerText) formData.append("studentAnswerText", studentAnswerText);
    if (correctAnswerText) formData.append("correctAnswerText", correctAnswerText);

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:5000/api/auth/exam-evaluate", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        setEvaluationResult(response.data);
      }
    } catch (error) {
      console.error("Error evaluating answers:", error);
      alert("Failed to evaluate answers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="evaluate-container">
      <h2>Evaluate Student Answers</h2>

      {/* Scrollable Section */}
      <div className="scrollable-section">
        {/* Question Section */}
        <div className="input-group">
          <div className="file-upload-section">
            <label>Upload Questions (PDF):</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setQuestionFile(e.target.files[0])}
            />
          </div>
          <div className="text-input-section">
            <label>Enter Question (Text):</label>
            <textarea
              placeholder="Type your question here..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>
        </div>

        {/* Student Answer Section */}
        <div className="input-group">
          <div className="file-upload-section">
            <label>Upload Student Answers (PDF):</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setStudentAnswerFile(e.target.files[0])}
            />
          </div>
          <div className="text-input-section">
            <label>Enter Student Answer (Text):</label>
            <textarea
              placeholder="Type the student's answer here..."
              value={studentAnswerText}
              onChange={(e) => setStudentAnswerText(e.target.value)}
            />
          </div>
        </div>

        {/* Correct Answer Section */}
        <div className="input-group">
          <div className="file-upload-section">
            <label>Upload Correct Answers (PDF):</label>
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setCorrectAnswerFile(e.target.files[0])}
            />
          </div>
          <div className="text-input-section">
            <label>Enter Correct Answer (Text):</label>
            <textarea
              placeholder="Type the correct answer here..."
              value={correctAnswerText}
              onChange={(e) => setCorrectAnswerText(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Evaluate Button */}
      <button onClick={handleEvaluate} disabled={isLoading}>
        {isLoading ? "Evaluating..." : "Evaluate"}
      </button>

      {/* Evaluation Result */}
      {evaluationResult && (
        <div className="evaluation-result">
          <h3>Evaluation Result:</h3>
          <p>Overall Score: {evaluationResult.overallScore}</p>
          <h4>Detailed Evaluations:</h4>
          <ul>
            {evaluationResult.evaluations.map((evalItem, index) => (
              <li key={index}>
                <p><strong>Question {evalItem.questionId}:</strong> {evalItem.question}</p>
                <p><strong>Student Answer:</strong> {evalItem.studentAnswer}</p>
                <p><strong>Correct Answer:</strong> {evalItem.correctAnswer}</p>
                <p><strong>Score:</strong> {evalItem.score}</p>
                <p><strong>Remarks:</strong> {evalItem.remarks}</p>
                <p><strong>Metrics:</strong></p>
                <ul>
                  <li>Quantitative: {evalItem.metrics.quantitative}</li>
                  <li>Aptitude: {evalItem.metrics.aptitude}</li>
                  <li>Reasoning: {evalItem.metrics.reasoning}</li>
                  <li>Understanding: {evalItem.metrics.understanding}</li>
                  <li>Remembering: {evalItem.metrics.remembering}</li>
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Evaluate;