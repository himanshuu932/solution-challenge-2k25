import React, { useState, useEffect } from "react";
import axios from "axios";
import "./styles/TestCreator.css";
const backend_link = "https://hackblitz-nine.vercel.app";

function TestCreator({ teacherId, onClose }) {
  const [testName, setTestName] = useState("");
  const [topic, setTopic] = useState("");
  const [type, setType] = useState("multiple-choice");
  const [level, setLevel] = useState("");
  const [testTime, setTestTime] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] = useState("");
  const [questions, setQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testCreated, setTestCreated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [teacherTests, setTeacherTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [selectedStudentPerformance, setSelectedStudentPerformance] =
    useState(null);
  const [showCreateTestModal, setShowCreateTestModal] = useState(false);
  const [showGeneratedQuestionsModal, setShowGeneratedQuestionsModal] =
    useState(false);

  // Fetch all tests created by the teacher
  useEffect(() => {
    const fetchTeacherTests = async () => {
      try {
        const response = await axios.get(
          `${backend_link}/api/auth/tests?teacherId=${teacherId}`
        );
        setTeacherTests(response.data.tests);
      } catch (err) {
        console.error("Failed to fetch teacher tests:", err);
      }
    };

    fetchTeacherTests();
  }, [teacherId, testCreated]);

  // Open the Create Test modal
  const openCreateTestModal = () => {
    setShowCreateTestModal(true);
  };

  // Close the Create Test modal
  const closeCreateTestModal = () => {
    setShowCreateTestModal(false);
    setTestName("");
    setTopic("");
    setLevel("");
    setNumberOfQuestions("");
    setQuestions([]);
    setSelectedQuestions([]);
    setError(null);
  };

  // Generate questions
  const generateQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `${backend_link}/api/auth/generate-questions`,
        {
          topic,
          type,
          level,
          Number: numberOfQuestions,
        }
      );

      if (response.data && Array.isArray(response.data.questions)) {
        setQuestions(response.data.questions);
        setShowGeneratedQuestionsModal(true); // Show modal with generated questions
      } else if (response.data && response.data.question) {
        setQuestions([response.data.question]);
        setShowGeneratedQuestionsModal(true); // Show modal with generated questions
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
      time: testTime,
    };

    try {
      const response = await axios.post(
        `${backend_link}/api/auth/tests`,
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
        closeCreateTestModal();
      }
    } catch (err) {
      setError("Failed to save the test. Please try again.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Fetch student performance
  const fetchStudentPerformance = async (studentId, testId) => {
    try {
      const response = await axios.get(
        `${backend_link}/api/auth/student-performance`,
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
      const testResponse = await axios.get(
        `${backend_link}/api/auth/tests?teacherId=${teacherId}`
      );
      if (!testResponse.data || !testResponse.data.tests) {
        throw new Error("Test data not found in the response.");
      }

      const selectedTest = testResponse.data.tests.find(
        (t) => t._id === test._id
      );

      if (!selectedTest) {
        throw new Error("Selected test not found in the response.");
      }

      if (selectedTest.attemptedBy && selectedTest.attemptedBy.length > 0) {
        const studentsResponse = await axios.post(
          `${backend_link}/api/auth/students`,
          {
            studentIds: selectedTest.attemptedBy,
          }
        );

        selectedTest.students = studentsResponse.data.students;
      }

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
    <div className="assessment-container">
      <div className="test-creator-container">
        {/* Header and Create Button */}
        <div className="teacher-tests-header">
          <h3>Your Test Library</h3>
          <button className="create-new-test-btn" onClick={openCreateTestModal}>
            <span className="icon">+</span> Create New Test
          </button>
        </div>

        {/* Teacher Tests Section */}
        <div className="teacher-tests-section">
          {teacherTests.length > 0 ? (
            <div className="test-cards">
              {teacherTests.map((test) => (
                <div
                  key={test._id}
                  className="test-card"
                  onClick={() => viewTestDetails(test)}
                >
                  <h4>{test.testName}</h4>
                  <p>
                    <span className="label">Topic:</span> {test.topic}
                  </p>
                  <p>
                    <span className="label">Type:</span> {test.type}
                  </p>
                  <p>
                    <span className="label">Level:</span> {test.level}
                  </p>
                  <p>
                    <span className="label">Questions :</span>{" "}
                    {test.numberOfQuestions}
                  </p>
                  <p>
                  <span className="label">Time :</span>{" "}
                  {test.time}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-tests-message">
              No tests created yet. Start by creating one!
            </p>
          )}
        </div>

        {/* Create Test Modal */}
        {showCreateTestModal && (
          <div className="create-test-modal">
            <div className="create-test-content">
              <button
                className="close-modal-btn"
                onClick={closeCreateTestModal}
              >
                &times;
              </button>
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
                  placeholder="Enter Topic"
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
                  placeholder="Enter Class/Level"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Number of Questions"
                  value={numberOfQuestions}
                  onChange={(e) => setNumberOfQuestions(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Test Time (minutes)"
                  value={testTime}
                  onChange={(e) => setTestTime(e.target.value)}
                  min="1"
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
            </div>
          </div>
        )}

        {/* Generated Questions Modal */}
        {showGeneratedQuestionsModal && (
          <div className="generated-questions-modal">
            <div className="generated-questions-content">
              <button
                className="close-modal-btn"
                onClick={() => setShowGeneratedQuestionsModal(false)}
              >
                &times;
              </button>
              <h3>Generated Questions</h3>
              <div className="questions-list">
                {questions.map((question, index) => (
                  <div
                    key={index}
                    className={`question-card ${
                      selectedQuestions.some(
                        (q) => q.question === question.question
                      )
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
                      {question.explanation?.correct ||
                        "No explanation provided."}
                    </div>
                  </div>
                ))}
              </div>
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
          </div>
        )}
        {/* Test Details Modal */}
        {selectedTest && (
          <div className="test-details-modal">
            <div className="test-details-content">
              <button className="close-modal-btn" onClick={closeTestDetails}>
                &times;
              </button>
              <h3>Test Details: {selectedTest.testName}</h3>
              <div className="test-meta">
                <p>
                  <span className="label">Topic:</span> {selectedTest.topic}
                </p>
                <p>
                  <span className="label">Type:</span> {selectedTest.type}
                </p>
                <p>
                  <span className="label">Level:</span> {selectedTest.level}
                </p>
                <p>
                  <span className="label">Questions:</span>{" "}
                  {selectedTest.numberOfQuestions}
                </p>
                <p>
                  <span className="label">Time:</span>{" "}
                  {selectedTest.time} minutes
                </p>
              </div>
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
                        className="student-link"
                      >
                        <span>{student.name}</span>
                        <span className="email">{student.email}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <h4>Questions:</h4>
              <div className="questions-list">
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
                    <p style={{color: "blue"}}>
                      <strong>Correct Answer:</strong> {question.correctAnswer}
                    </p>
                    <p style={{color:"green"}}>
                      <strong>Explanation:</strong>{" "}
                      {question.explanation?.correct ||
                        "No explanation provided."}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Student Performance Modal */}
        {selectedStudentPerformance && (
          <div className="student-performance-modal">
            <div className="student-performance-content">
              <button
                className="close-modal-btn"
                onClick={() => setSelectedStudentPerformance(null)}
              >
                &times;
              </button>
              <h3>Performance of {selectedStudentPerformance.studentName}</h3>
              <div className="performance-meta">
                <p>
                  <span className="label">Test ID:</span>{" "}
                  {selectedStudentPerformance.testId}
                </p>
                <p>
                  <span className="label">Status:</span>{" "}
                  {selectedStudentPerformance.status}
                </p>
                <p>
                  <span className="label">Score:</span>{" "}
                  {selectedStudentPerformance.score}
                </p>
                <p>
                  <span className="label">Total Questions:</span>{" "}
                  {selectedStudentPerformance.totalQuestions}
                </p>
                <p>
                  <span className="label">Correct Answers:</span>{" "}
                  {selectedStudentPerformance.correctAnswers}
                </p>
                <p>
                  <span className="label">Incorrect Answers:</span>{" "}
                  {selectedStudentPerformance.incorrectAnswers}
                </p>
                <p>
                  <span className="label">Attempted At:</span>{" "}
                  {new Date(
                    selectedStudentPerformance.attemptedAt
                  ).toLocaleString()}
                </p>
                <p>
                  <span className="label">Time Taken:</span>{" "}
                  {selectedStudentPerformance.timeTaken} seconds
                </p>
              </div>

              <h4>Answers:</h4>
              <ul className="answers-list">
                {selectedStudentPerformance.answers.map((answer, index) => (
                  <li key={index} className="answer-item">
                    <p>
                      <strong>Question {answer.questionId + 1}:</strong>
                    </p>
                    <p>Selected Option: {answer.selectedOption}</p>
                    <p>Correct: {answer.isCorrect ? "Yes" : "No"}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TestCreator;
