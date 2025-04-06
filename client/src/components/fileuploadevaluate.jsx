import React, { useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import "./styles/fileuploadevaluate.css";

const FileUploadEvaluation = ({ userId }) => {
  const [questionFile, setQuestionFile] = useState(null);
  const [answerFile, setAnswerFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("");
  const [extractedQuestionsText, setExtractedQuestionsText] = useState("");
  const [extractedAnswersText, setExtractedAnswersText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const backend_link = "https://hackblitz-nine.vercel.app";

  // Function to upload a file to /upload-pdf and get its extracted text
  const uploadAndExtractText = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", userId);
    const response = await axios.post(`${backend_link}/api/auth/upload-pdf`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  };

  // Step 1: Extract text from both files and display it
  const handleUploadFiles = async (e) => {
    e.preventDefault();
    if (!questionFile || !answerFile) {
      setUploadStatus("Please upload both question and answer files");
      return;
    }
    setIsProcessing(true);
    setUploadStatus("Extracting text from files...");
    try {
      const [questionsData, answersData] = await Promise.all([
        uploadAndExtractText(questionFile),
        uploadAndExtractText(answerFile),
      ]);
      if (!questionsData.text || !answersData.text) {
        throw new Error("Could not extract text from files");
      }
      setExtractedQuestionsText(questionsData.text);
      setExtractedAnswersText(answersData.text);
      setShowExtractedText(true);
      setUploadStatus("Text extracted successfully. Review below.");
    } catch (error) {
      console.error("Error extracting text:", error);
      setUploadStatus("Failed to extract text from files. Please try again.");
      setShowExtractedText(false);
    } finally {
      setIsProcessing(false);
    }
  };

  // Step 2: Evaluate using the extracted text
  const handleEvaluateNow = async () => {
    setIsProcessing(true);
    setUploadStatus("Evaluating answers...");
    try {
      const response = await axios.post(`${backend_link}/api/auth/evaluate-answer`, {
        userId,
        questionsText: extractedQuestionsText,
        answersText: extractedAnswersText
      });
  
      setEvaluationResult(response.data);
      setUploadStatus("Evaluation completed successfully!");
      setShowExtractedText(false);
    } catch (error) {
      console.error("Error evaluating files:", error);
      setUploadStatus("Failed to evaluate files. Please try again.");
      setEvaluationResult(null);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <motion.div
      className="file-upload-section"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h3>Evaluate Question &amp; Answer Files</h3>
      <form onSubmit={handleUploadFiles}>
        <div className="form-group" style={{ marginBottom: "15px" }}>
          <label className="evaluation-form-label">Questions File:</label>
          <input
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={(e) => setQuestionFile(e.target.files[0])}
            className="evaluation-file-input"
          />
        </div>
        <div className="form-group" style={{ marginBottom: "20px" }}>
          <label className="evaluation-form-label">Answers File:</label>
          <input
            type="file"
            accept=".pdf,.txt,.docx"
            onChange={(e) => setAnswerFile(e.target.files[0])}
            className="evaluation-file-input"
          />
        </div>
        <button type="submit" disabled={isProcessing} className="evaluate-files-btn">
          {isProcessing ? "Processing..." : "Upload Files"}
        </button>
      </form>

      {uploadStatus && <div className="upload-status">{uploadStatus}</div>}

      {showExtractedText && (
        <div className="extracted-text-section">
          <h4>Extracted Questions:</h4>
          <div className="extracted-text-box">
            {extractedQuestionsText.split("\n").map((line, i) => (
              <p key={`q-${i}`}>{line}</p>
            ))}
          </div>

          <h4>Extracted Answers:</h4>
          <div className="extracted-text-box">
            {extractedAnswersText.split("\n").map((line, i) => (
              <p key={`a-${i}`}>{line}</p>
            ))}
          </div>

          <button onClick={handleEvaluateNow} className="evaluate-files-btn" disabled={isProcessing}>
            {isProcessing ? "Evaluating..." : "Evaluate Now"}
          </button>
          <button
            onClick={() => {
              setShowExtractedText(false);
              setExtractedQuestionsText("");
              setExtractedAnswersText("");
            }}
            className="cancel-evaluation-btn"
          >
            Cancel
          </button>
        </div>
      )}

      {evaluationResult && (
        <div className="evaluation-results">
          <h4>Evaluation Results</h4>
          <div>
            <strong>Overall Score:</strong> {Math.round(evaluationResult.overallScore * 100)}%
          </div>
          <div className="evaluation-items-container">
            {evaluationResult.evaluations.map((evalItem, index) => (
              <div key={index} className="evaluation-item">
                <div>
                  <strong>Question {evalItem.questionNumber}:</strong>
                </div>
                <div>{evalItem.question}</div>
                <div>
                  <strong>Your Answer:</strong> {evalItem.answer.substring(0, 100)}
                  {evalItem.answer.length > 100 ? "..." : ""}
                </div>
                <div>
                  <strong>Score:</strong> {Math.round(evalItem.score * 100)}%
                </div>
                <div>
                  <strong>Feedback:</strong> {evalItem.feedback}
                </div>
                <div>
                  <strong>Metrics:</strong>
                  <ul>
                    <li>Clarity: {Math.round(evalItem.metrics.clarity )}%</li>
                    <li>Depth: {Math.round(evalItem.metrics.depth )}%</li>
                    <li>Accuracy: {Math.round(evalItem.metrics.accuracy )}%</li>
                    <li>Originality: {Math.round(evalItem.metrics.originality )}%</li>
                    <li>Practicality: {Math.round(evalItem.metrics.practicality )}%</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default FileUploadEvaluation;
