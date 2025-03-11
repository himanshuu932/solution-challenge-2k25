import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter } from "react-icons/fa";
import axios from "axios"; // Import axios for API calls
import MCQQuiz from "./test/MCQQuiz";
import ShortAnswer from "./test/Shortanswer"; 
import "./styles/TestComponent.css";

const TestComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("All");
  const [filterTeacher, setFilterTeacher] = useState("All");
  const [filterTopic, setFilterTopic] = useState("All");
  const [filterQuestions, setFilterQuestions] = useState("All");
  const [filterType, setFilterType] = useState("All"); // New state for test type filter
  const [filterVisible, setFilterVisible] = useState(false);

  const [selectedTest, setSelectedTest] = useState(null);
  const [startTest, setStartTest] = useState(false);
  const [tests, setTests] = useState([]); // State to store test data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch test data from the backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/tests"); // Replace with your API endpoint
        setTests(response.data.tests);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch tests. Please try again.");
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  // Compute unique teacher and topic options for the dropdowns
  const uniqueTeachers = Array.from(new Set(tests.map((test) => test.teacherId)));
  const uniqueTopics = Array.from(new Set(tests.map((test) => test.topic)));

  // Filter tests based on search term and selected filters
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
                <button
                  className="filter-btn"
                  onClick={() => setFilterVisible(!filterVisible)}
                >
                  <FaFilter /> Filter
                </button>
              </div>
            </header>

            {/* Filter options panel */}
            {filterVisible && (
              <div className="filter-options">
                <select
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                >
                  <option value="All">All Difficulties</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <select
                  value={filterTeacher}
                  onChange={(e) => setFilterTeacher(e.target.value)}
                >
                  <option value="All">All Teachers</option>
                  {uniqueTeachers.map((teacher, index) => (
                    <option key={index} value={teacher}>
                      {teacher}
                    </option>
                  ))}
                </select>
                <select
                  value={filterTopic}
                  onChange={(e) => setFilterTopic(e.target.value)}
                >
                  <option value="All">All Topics</option>
                  {uniqueTopics.map((topic, index) => (
                    <option key={index} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
                <select
                  value={filterQuestions}
                  onChange={(e) => setFilterQuestions(e.target.value)}
                >
                  <option value="All">All Question Counts</option>
                  <option value="less10">Less than 10</option>
                  <option value="10to20">10 to 20</option>
                  <option value="more20">More than 20</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="All">All Types</option>
                  <option value="multiple-choice">Multiple Choice</option>
                  <option value="short-answer">Short Answer</option>
                  <option value="long-answer">Long Answer</option>
                </select>
              </div>
            )}

            {loading ? (
              <div className="loading-message">Loading tests...</div>
            ) : error ? (
              <div className="error-message">{error}</div>
            ) : (
              <section className="test-grid">
                {filteredTests.map((test, index) => (
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
                        <div
                          className="progress"
                          style={{ width: `${test.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {test.progress || 0}%
                      </span>
                    </div>
                    <div className="test-actions">
                      <button className={`test-btn ${test.status || "pending"}`}>
                        {test.status || "Pending"}
                      </button>
                      <button className="test-btn start" onClick={() => handleTestClick(test)}>
                        Start
                      </button>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </div>
        </main>
      ) : (
        <main className="test-main">
          {selectedTest.type === "multiple-choice" && (
            <MCQQuiz setStartTest={setStartTest} questions={selectedTest.questions} />
          )}
          {(selectedTest.type === "short-answer" ||
            selectedTest.type === "long-answer") && (
            <ShortAnswer setStartTest={setStartTest} questions={selectedTest.questions} />
          )}
        </main>
      )}
    </div>
  );
};

export default TestComponent;
