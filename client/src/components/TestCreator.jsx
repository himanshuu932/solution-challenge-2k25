import React, { useState, useEffect } from "react";
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
  const [teacherTests, setTeacherTests] = useState([]); // All tests created by the teacher
  const [selectedTest, setSelectedTest] = useState(null); // Selected test for detailed view
  const [selectedStudentPerformance, setSelectedStudentPerformance] =
    useState(null);

  // Fetch all tests created by the teacher
  useEffect(() => {
    const fetchTeacherTests = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/auth/tests?teacherId=${teacherId}`
        );
        setTeacherTests(response.data.tests);
      } catch (err) {
        console.error("Failed to fetch teacher tests:", err);
      }
    };

    fetchTeacherTests();
  }, [teacherId, testCreated]); // Refetch tests when a new test is created

  // Function to generate questions using the QuestionGenerator API
  const generateQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/generate-questions",
        {
          topic,
          type,
          level,
          Number: numberOfQuestions, // ensure your backend expects this parameter name
        }
      );

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
    const isSelected = selectedQuestions.some(
      (q) => q.question === question.question
    );

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
      setError(
        "Please fill all fields and select at least one question before saving the test."
      );
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
      const response = await axios.post(
        "http://localhost:5000/api/auth/tests",
        testData
      );
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

  const fetchStudentPerformance = async (studentId, testId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/student-performance`,
        {
          params: {
            studentId,
            testId,
          },
        }
      );
      setSelectedStudentPerformance(response.data.performance);
    } catch (err) {
      console.error("Failed to fetch student performance:", err);
      setError("Failed to fetch student performance. Please try again.");
    }
  };

  // View details of a specific test
  const viewTestDetails = async (test) => {
    try {
      // Fetch all tests for the teacher
      const testResponse = await axios.get(
        `http://localhost:5000/api/auth/tests?teacherId=${teacherId}`
      );
      console.log("API Response:", testResponse.data.tests); // Log the entire tests array for debugging

      // Check if the response contains the expected data
      if (!testResponse.data || !testResponse.data.tests) {
        throw new Error("Test data not found in the response.");
      }

      // Find the selected test in the tests array
      const selectedTest = testResponse.data.tests.find(
        (t) => t._id === test._id
      );

      // Check if the selected test was found
      if (!selectedTest) {
        throw new Error("Selected test not found in the response.");
      }

      // Check if the selectedTest has the attemptedBy property
      if (selectedTest.attemptedBy && selectedTest.attemptedBy.length > 0) {
        // Fetch student details for the attemptedBy array
        const studentsResponse = await axios.post(
          "http://localhost:5000/api/auth/students",
          {
            studentIds: selectedTest.attemptedBy, // Send the array of student IDs
          }
        );

        // Add student details to the test object
        selectedTest.students = studentsResponse.data.students;
      }

      // Set the selected test with student details
      setSelectedTest(selectedTest);
    } catch (err) {
      console.error("Failed to fetch test or student details:", err);
      setError("Failed to fetch test details. Please try again.");
    }
  };
  // Close the detailed view
  const closeTestDetails = () => {
    setSelectedTest(null);
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

      <button
        className="generate-btn"
        onClick={generateQuestions}
        disabled={loading}
      >
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
                selectedQuestions.some((q) => q.question === question.question)
                  ? "selected"
                  : ""
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
            Review your selected questions above. When you're ready, click "Save
            Test" to store your test.
          </p>
          {/* Save Test Button */}
          <button
            className="save-test-btn"
            onClick={saveTest}
            disabled={isSaving}
          >
            {isSaving
              ? "Saving..."
              : `Save Test (${selectedQuestions.length} questions selected)`}
          </button>
        </div>
      )}

      {/* Success Message */}
      {testCreated && (
        <div className="success-message">
          <p>Test created successfully!</p>
          <button
            className="create-another-btn"
            onClick={() => setTestCreated(false)}
          >
            Create Another Test
          </button>
          <button className="close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      )}

      {/* Display all tests created by the teacher */}
      <div className="teacher-tests-section">
        <h3>Your Created Tests</h3>
        {teacherTests.length > 0 ? (
          <div className="test-cards">
            {teacherTests.map((test) => (
              <div
                key={test._id}
                className="test-card"
                onClick={() => viewTestDetails(test)}
              >
                <h4>{test.testName}</h4>
                <p>Topic: {test.topic}</p>
                <p>Type: {test.type}</p>
                <p>Level: {test.level}</p>
                <p>Questions: {test.numberOfQuestions}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No tests created yet.</p>
        )}
      </div>

      {/* Detailed view of a selected test */}
      {selectedTest && (
        <div className="test-details-modal">
          <div className="test-details-content">
            <h3>Test Details: {selectedTest.testName}</h3>
            <p>Topic: {selectedTest.topic}</p>
            <p>Type: {selectedTest.type}</p>
            <p>Level: {selectedTest.level}</p>
            <p>Number of Questions: {selectedTest.numberOfQuestions}</p>
            <h4>Questions:</h4>

            {/* Display the list of students who attempted the test */}
            {selectedTest.students && selectedTest.students.length > 0 && (
              <div className="attempted-by-section">
                <h4>Students Who Attempted This Test:</h4>
                <ul className="attempted-by-list">
                  {selectedTest.students.map((student, index) => (
                    <li
                      key={index}
                      onClick={() =>
                        fetchStudentPerformance(student._id, selectedTest._id)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {student.name} ({student.email})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedTest.questions.map((question, index) => (
              <div key={index} className="question-detail">
                <h5>
                  Question {index + 1}: {question.question}
                </h5>
                {question.options && (
                  <ul className="options-list">
                    {question.options.map((option, idx) => (
                      <li key={idx}>
                        <strong>{option.label}:</strong> {option.text}
                      </li>
                    ))}
                  </ul>
                )}
                <p>
                  <strong>Correct Answer:</strong> {question.correctAnswer}
                </p>
                <p>
                  <strong>Explanation:</strong>{" "}
                  {question.explanation?.correct || "No explanation provided."}
                </p>
              </div>
            ))}
            <button className="close-details-btn" onClick={closeTestDetails}>
              Close
            </button>
          </div>
        </div>
      )}

      {selectedStudentPerformance && (
        <div className="student-performance-modal">
          <div className="student-performance-content">
            <h3>Performance of {selectedStudentPerformance.studentName}</h3>
            <p>Test ID: {selectedStudentPerformance.testId}</p>
            <p>Status: {selectedStudentPerformance.status}</p>
            <p>Score: {selectedStudentPerformance.score}</p>
            <p>Total Questions: {selectedStudentPerformance.totalQuestions}</p>
            <p>Correct Answers: {selectedStudentPerformance.correctAnswers}</p>
            <p>
              Incorrect Answers: {selectedStudentPerformance.incorrectAnswers}
            </p>
            <p>
              Attempted At:{" "}
              {new Date(
                selectedStudentPerformance.attemptedAt
              ).toLocaleString()}
            </p>
            <p>Time Taken: {selectedStudentPerformance.timeTaken} seconds</p>
            <h4>Answers:</h4>
            <ul>
              {selectedStudentPerformance.answers.map((answer, index) => (
                <li key={index}>
                  <p>Question {answer.questionId + 1}:</p>
                  <p>Selected Option: {answer.selectedOption}</p>
                  <p>Correct: {answer.isCorrect ? "Yes" : "No"}</p>
                </li>
              ))}
            </ul>
            <button
              className="close-performance-btn"
              onClick={() => setSelectedStudentPerformance(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestCreator;
