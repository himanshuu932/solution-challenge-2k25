import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaTrophy } from "react-icons/fa";
import axios from "axios"; // Import axios for API calls
import MCQQuiz from "./test/MCQQuiz";
import ShortAnswer from "./test/Shortanswer"; 
import "./styles/TestComponent.css";

const TestComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
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

  const handleTestClick = (test) => {
    setSelectedTest(test);
    // For multiple-choice or short/long answer tests, start the test view.
    if (test.type === "multiple-choice" || test.type === "short-answer" || test.type === "long-answer") {
      setStartTest(true);
    } else {
      setStartTest(false);
    }
  };

  // Filter tests based on search term and selected filter
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.testName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "All" || test.level === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="test-dashboard">
      {!startTest ? (
        <main className="test-main">
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
              <button className="filter-btn">
                <FaFilter /> Filter
              </button>
            </div>
          </header>
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
                    <p><strong>Difficulty:</strong> {test.level}</p>
                    <p><strong>Questions:</strong> {test.numberOfQuestions}</p>
                    <p><strong>Time:</strong> {test.time || "N/A"}</p>
                    <p><strong>Teacher:</strong> {test.teacherId}</p>
                    <p><strong>Type:</strong> {test.type}</p>
                  </div>
                  <div className="progress-bar-container">
                    <div className="progress-bar">
                      <div className="progress" style={{ width: `${test.progress || 0}%` }}></div>
                    </div>
                    <span className="progress-text">{test.progress || 0}%</span>
                  </div>
                  <button className={`test-btn ${test.status || "pending"}`}>{test.status || "Pending"}</button>
                  <button className="test-btn start" onClick={() => handleTestClick(test)}>
                    Start
                  </button>
                </div>
              ))}
            </section>
          )}
        </main>
      ) : (
        // When a test is started, hide all other components and only show the test view.
        <main className="test-main">
          {selectedTest.type === "multiple-choice" && (
            <MCQQuiz setStartTest={setStartTest} questions={selectedTest.questions} />
          )}
          {(selectedTest.type === "short-answer" || selectedTest.type === "long-answer") && (
            <ShortAnswer setStartTest={setStartTest} questions={selectedTest.questions} />
          )}
        </main>
      )}
    </div>
  );
};

export default TestComponent;
