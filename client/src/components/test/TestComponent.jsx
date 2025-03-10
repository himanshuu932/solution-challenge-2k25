import React, { useState, useEffect } from "react";
import { FaSearch, FaFilter, FaTrophy } from "react-icons/fa";
import axios from "axios"; // Import axios for API calls
import MCQQuiz from "./MCQQuiz";
import ShortAnswer from "./Shortanswer"; 
import TestSelection from "../TestSelection";
import "../styles/TestComponent.css";

const TestComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [selectedTest, setSelectedTest] = useState(null);
  const [difficulty, setDifficulty] = useState("easy");
  const [startTest, setStartTest] = useState(false);
  const [tests, setTests] = useState([]); // State to store test data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const badges = [
    { name: "Speedster", description: "Completed a test in under 10 minutes", icon: <FaTrophy className="badge-icon" /> },
    { name: "Mastermind", description: "Scored 100% on a quiz", icon: <FaTrophy className="badge-icon" /> },
  ];

  // Fetch test data from the backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/tests"); // Replace with your API endpoint
        setTests(response.data.tests); // Store the fetched test data
        setLoading(false); // Set loading to false
      } catch (err) {
        console.log(err);
        setError("Failed to fetch tests. Please try again."); // Set error message
        setLoading(false); // Set loading to false
        console.error(err);
      }
    };

    fetchTests();
  }, []);

  const handleTestClick = (test) => {
    setSelectedTest(test);

    // If the test type is "multiple-choice", directly start the MCQ quiz
    if (test.type === "multiple-choice") {
      setStartTest(true); // Start the MCQ quiz
    }  else if (test.type === "short-answer" || test.type === "long-answer") {
      setStartTest(true); // Start the ShortAnswer component
    } else {
      setStartTest(false); // Show the test selection screen for other types
    }
  };

  const handleStartTest = () => {
    setStartTest(true);
  };

  // Filter tests based on search term and selected filter
  const filteredTests = tests.filter((test) => {
    const matchesSearch = test.testName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "All" || test.level === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="test-dashboard">
      <aside className="sidebar">
        <h3>Badges Earned</h3>
        <div className="badges-container">
          {badges.map((badge, index) => (
            <div key={index} className="badge-card">
              {badge.icon}
              <div>
                <h4>{badge.name}</h4>
                <p>{badge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

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
              <div key={index} className="test-card" onClick={() => handleTestClick(test)}>
                <div className="test-header-card">
                  <h3>{test.testName}</h3> {/* Use testName from the database */}
                  <p className="test-subject">{test.topic}</p> {/* Use topic from the database */}
                </div>
                <div className="test-info">
                  <p><strong>Difficulty:</strong> {test.level}</p> {/* Use level from the database */}
                  <p><strong>Questions:</strong> {test.numberOfQuestions}</p> {/* Use numberOfQuestions from the database */}
                  <p><strong>Time:</strong> {test.time || "N/A"}</p> {/* Add time field to your database if needed */}
                  <p><strong>Teacher:</strong> {test.teacherId}</p> {/* Use teacherId from the database */}
                  <p><strong>Type:</strong> {test.type}</p> {/* Add status field to your database if needed */}
                </div>
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div className="progress" style={{ width: `${test.progress || 0}%` }}></div> {/* Add progress field to your database if needed */}
                  </div>
                  <span className="progress-text">{test.progress || 0}%</span>
                </div>
                <button className={`test-btn ${test.status || "pending"}`}>{test.status || "Pending"}</button> {/* Add status field to your database if needed */}
              </div>
            ))}
          </section>
        )}

        {selectedTest && !startTest && selectedTest.type !== "multiple-choice" && (
          <TestSelection
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            startTest={handleStartTest}
          />
        )}

        {startTest && selectedTest && selectedTest.type === "multiple-choice" && (
          <MCQQuiz questions={selectedTest.questions} /> 
        )}

        {startTest && selectedTest && (selectedTest.type === "short-answer" || selectedTest.type === "long-answer") && (
          <ShortAnswer questions={selectedTest.questions} />
        )}
      </main>
    </div>
  );
};

export default TestComponent;