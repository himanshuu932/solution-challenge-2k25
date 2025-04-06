import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import MCQQuiz from "./test/MCQQuiz";
import ShortAnswer from "./test/Shortanswer"; 
import "./styles/TestComponent.css";

const TestComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterTeacher, setFilterTeacher] = useState("All");
  const [filterTopic, setFilterTopic] = useState("All");
  const [filterQuestions, setFilterQuestions] = useState("All");
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All"); 
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [startTest, setStartTest] = useState(false);
  const [tests, setTests] = useState([]);
  
  const [userTestDetails, setUserTestDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get user id from token
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

  console.log("thsi is userId: " + userId);

  useEffect(() => {
    const fetchTests = async () => {
      if (!userId) return; // Don't fetch if no user ID
  
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(`https://hackblitz-nine.vercel.app/api/auth/tests`, {
          params: {
            studentId: userId,
          }
        });
  
        if (response.data.success) {
          setTests(response.data.tests);
        } else {
          setError(response.data.message || "Failed to fetch tests");
        }
      } catch (err) {
        console.error("Fetch tests error:", err);
        setError(err.response?.data?.message || "Failed to fetch tests. Please try again.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchTests();
  }, [userId]); // Add userId as dependency

  // Fetch user test attempt details based on userId
  useEffect(() => {
    const fetchUserTestDetails = async () => {
      if (!userId) return;
      try {
        const response = await axios.get(`https://hackblitz-nine.vercel.app/api/auth/test-details?userId=${userId}`);
        // response.data.tests is now an array of test IDs
        setUserTestDetails(response.data.tests);
      } catch (err) {
        console.error("Error fetching user test details:", err);
      }
    };

    fetchUserTestDetails();
  }, [userId]);

  const uniqueTeachers = Array.from(new Set(tests.map((test) => test.teacherId)));
  const uniqueTopics = Array.from(new Set(tests.map((test) => test.topic)));

  // Apply filters to all tests including the new status filter
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.testName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === "All" || test.level === filterDifficulty;
    const matchesTeacher = filterTeacher === "All" || test.teacherId === filterTeacher;
    const matchesTopic = filterTopic === "All" || test.topic === filterTopic;
    const matchesType = filterType === "All" || test.type === filterType;
    let matchesQuestions = true;
    if (filterQuestions === "less10") {
      matchesQuestions = test.numberOfQuestions < 10;
    } else if (filterQuestions === "10to20") {
      matchesQuestions = test.numberOfQuestions >= 10 && test.numberOfQuestions <= 20;
    } else if (filterQuestions === "more20") {
      matchesQuestions = test.numberOfQuestions > 20;
    }

    // Determine if the test is attempted
    const isAttempted = userTestDetails.includes(test._id);
    // Apply the status filter
    if (filterStatus === "Attempted" && !isAttempted) return false;
    if (filterStatus === "Pending" && isAttempted) return false;

    return matchesSearch && matchesDifficulty && matchesTeacher && matchesTopic && matchesType && matchesQuestions;
  });

  const handleTestClick = (test) => {
    setSelectedTest(test);
    if (
      test.type === "multiple-choice" ||
      test.type === "short-answer" ||
      test.type === "long-answer"
    ) {
      setStartTest(true);
    } else {
      setStartTest(false);
    }
  };

  return (
    <div className="test-dashboard">
      {!startTest ? (
        <main className="test-main">
          <div className="assessment-container">
            <header className="test-header">
              <h2>Assessments</h2>
              <div className="search-filter-container">
                <div className="search-box">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search tests..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="filter-btn" onClick={() => setFilterVisible(!filterVisible)}>
                  <FaFilter /> Filter
                </button>
              </div>
            </header>

            {filterVisible && (
              <div className="filter-options">
                <select value={filterDifficulty} onChange={(e) => setFilterDifficulty(e.target.value)}>
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <select value={filterTeacher} onChange={(e) => setFilterTeacher(e.target.value)}>
                  <option value="All">All Teachers</option>
                  {uniqueTeachers.map((teacher, index) => (
                    <option key={index} value={teacher}>
                      {teacher}
                    </option>
                  ))}
                </select>
                <select value={filterTopic} onChange={(e) => setFilterTopic(e.target.value)}>
                  <option value="All">All Topics</option>
                  {uniqueTopics.map((topic, index) => (
                    <option key={index} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
                <select value={filterQuestions} onChange={(e) => setFilterQuestions(e.target.value)}>
                  <option value="All">All Question Counts</option>
                  <option value="less10">Less than 10</option>
                  <option value="10to20">10 to 20</option>
                  <option value="more20">More than 20</option>
                </select>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="All">All Types</option>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="long-answer">Long Answer</option>
                </select>
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="All">All Status</option>
                  <option value="Attempted">Attempted</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            )}

            {loading ? (
              <div className="loading-message">Loading tests...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <section className="test-grid">
                {filteredTests.map((test, index) => {
                  // Check if test is attempted based on userTestDetails array
                  const isAttempted = userTestDetails.includes(test._id);
                  return (
                    <div key={index} className="test-card">
                      <div className="test-header-card">
                        <h3>{test.testName}</h3>
                        <p className="test-subject">{test.topic}</p>
                      </div>
                      <div className="test-info">
                        <p>
                          <strong>Difficulty:</strong> {test.level}
                        </p>
                        <p>
                          <strong>Questions:</strong> {test.numberOfQuestions}
                        </p>
                        <p>
                          <strong>Time:</strong> {test.time || "N/A"}
                        </p>
                        <p>
                          <strong>Teacher:</strong> {test.teacherId}
                        </p>
                        <p>
                          <strong>Type:</strong> {test.type}
                        </p>
                      </div>
                      <div className="progress-bar-container">
                        <div className="progress-bar">
                          {/* If attempted, progress is 100%; otherwise, 0% */}
                          <div className="progress" style={{ width: isAttempted ? "100%" : "0%" }}></div>
                        </div>
                        <span className="progress-text">{isAttempted ? "100%" : "0%"}</span>
                      </div>
                      <div className="test-actions">
                        {isAttempted ? (
                          <>
                            <button className="test-btn attempted">Completed</button>
                            <button className="test-btn start" onClick={() => handleTestClick(test)}>
                              Reattempt
                            </button>
                          </>
                        ) : (
                          <>
                            <button className="test-btn pending">Pending</button>
                            <button className="test-btn start" onClick={() => handleTestClick(test)}>
                              Start
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </section>
            )}
          </div>
        </main>
      ) : (
        <main className="test-main">
          {selectedTest.type === "multiple-choice" && (
            <MCQQuiz setStartTest={setStartTest} questions={selectedTest.questions} testId={selectedTest._id}  timeLimit={selectedTest.time} />
          )}
          {(selectedTest.type === "short-answer" || selectedTest.type === "long-answer") && (
            <ShortAnswer setStartTest={setStartTest} questions={selectedTest.questions} testId={selectedTest._id}  timeLimit={selectedTest.time} />
          )}
        </main>
      )}
    </div>
  );
};

export default TestComponent;
