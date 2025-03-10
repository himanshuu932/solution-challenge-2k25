import React, { useState } from "react";
import axios from "axios";
import "./styles/TestCreator.css"; // Ensure this CSS file is updated

function TestCreator({ teacherId, onClose }) {
  const [testName, setTestName] = useState("");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("multiple-choice");
  const [level, setLevel] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("");
  const [questions, setQuestions] = useState([]); // All generated questions
  const [selectedQuestions, setSelectedQuestions] = useState([]); // Questions selected for the test
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testCreated, setTestCreated] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Loading state for saving
  const [showSummary, setShowSummary] = useState(false); // Toggle summary view

  console.log("Teacher ID:", teacherId);


  // Function to generate questions using the QuestionGenerator API
  const generateQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post("http://localhost:5000/api/auth/generate-questions", {
        topic,
        type,
        level,
        Number: numberOfQuestions, // ensure your backend expects this parameter name
      });

      if (response.data && Array.isArray(response.data.questions)) {
        setQuestions(response.data.questions);
      } else if (response.data && response.data.question) {
        setQuestions([response.data.question]);
      } else {
        setError("Invalid response format from the server.");
      }
    } catch (err) {
      setError("Failed to generate questions. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  // Toggle selection of a question
  const toggleQuestionSelection = (index) => {
    const question = questions[index];
    const isSelected = selectedQuestions.some((q) => q.question === question.question);

    if (isSelected) {
      setSelectedQuestions((prev) =>
        prev.filter((q) => q.question !== question.question)
      );
    } else {
      setSelectedQuestions((prev) => [...prev, question]);
    }
  };

  // Save test to backend
  const saveTest = async () => {
    if (!testName || !topic || !level || selectedQuestions.length === 0) {
      setError("Please fill all fields and select at least one question before saving the test.");
      return;
    }

    setIsSaving(true);
    setError(null);

    const testData = {
      testName,
      topic,
      type,
      level,
      numberOfQuestions: selectedQuestions.length,
      questions: selectedQuestions,
      teacherId,
    };

    try {
      const response = await axios.post("http://localhost:5000/api/auth/tests", testData);
      if (response.data.success) {
        setTestCreated(true);
        setError(null);
        alert("Test created successfully!");

        // Reset the form after saving
        setTestName("");
        setTopic("");
        setLevel("");
        setNumberOfQuestions("");
        setQuestions([]);
        setSelectedQuestions([]);
        setShowSummary(false);
      }
    } catch (err) {
      setError("Failed to save the test. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle summary view
  const toggleSummary = () => {
    setShowSummary(!showSummary);
  };

  return (
    <div className="test-creator-container">
      <h2>Create a New Test</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="Test Name"
          value={testName}
          onChange={(e) => setTestName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Enter topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
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
          required
        />
        <input
          type="number"
          placeholder="Number of questions to generate"
          value={numberOfQuestions}
          onChange={(e) => setNumberOfQuestions(e.target.value)}
          required
        />
      </div>

      <button className="generate-btn" onClick={generateQuestions} disabled={loading}>
        {loading ? "Generating..." : "Generate Questions"}
      </button>

      {error && <p className="error-message">{error}</p>}

      {/* Questions List */}
      <div className="questions-list">
        {questions.length > 0 ? (
          questions.map((question, index) => (
            <div
              key={index}
              className={`question-card ${
                selectedQuestions.some((q) => q.question === question.question) ? "selected" : ""
              }`}
              onClick={() => toggleQuestionSelection(index)}
            >
              <h3>
                Question {index + 1}: {question.question}
              </h3>
              {question.options && (
                <ul className="options-list">
                  {question.options.map((option, idx) => (
                    <li key={idx}>
                      <strong>{option.label}:</strong> {option.text}
                    </li>
                  ))}
                </ul>
              )}
              <div className="correct-answer">
                <strong>Correct Answer:</strong> {question.correctAnswer}
              </div>
              <div className="explanation">
                <strong>Explanation:</strong>{" "}
                {question.explanation?.correct || "No explanation provided."}
              </div>
            </div>
          ))
        ) : (
          <p>No questions generated yet.</p>
        )}
      </div>

      {/* Selected Questions Summary and Save Test */}
      {selectedQuestions.length > 0 && (
        <div className="selected-actions">
          <div className="summary-section">
            <button className="summary-toggle-btn" onClick={toggleSummary}>
              {showSummary ? "Hide Summary" : "Show Summary"}
            </button>
            {showSummary && (
              <div className="selected-questions-summary">
                <h3>Selected Questions</h3>
                {selectedQuestions.map((question, index) => (
                  <div key={index} className="summary-question-card">
                    <h4>
                      Question {index + 1}: {question.question}
                    </h4>
                    <div className="correct-answer">
                      <strong>Correct Answer:</strong> {question.correctAnswer}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Instructional message */}
          <p className="instruction-message">
            Review your selected questions above. When you're ready, click "Save Test" to store your test.
          </p>
          {/* Save Test Button */}
          <button className="save-test-btn" onClick={saveTest} disabled={isSaving}>
            {isSaving ? "Saving..." : `Save Test (${selectedQuestions.length} questions selected)`}
          </button>
        </div>
      )}

      {/* Success Message */}
      {testCreated && (
        <div className="success-message">
          <p>Test created successfully!</p>
          <button className="create-another-btn" onClick={() => setTestCreated(false)}>
            Create Another Test
          </button>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default TestCreator;
