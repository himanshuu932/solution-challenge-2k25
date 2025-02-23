import React, { useState } from "react";
import { FaSearch, FaFilter, FaTrophy } from "react-icons/fa";
import "./styles/TestComponent.css";

const TestComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("All");

  const tests = [
    { title: "Chapter 5: Trigonometry Quiz", subject: "Mathematics", difficulty: "Hard", questions: 20, time: "30 min", status: "Pending", progress: 50 },
    { title: "Physics Laws Assessment", subject: "Physics", difficulty: "Medium", questions: 15, time: "25 min", status: "Completed", progress: 100 },
    { title: "Chemistry Basics Test", subject: "Chemistry", difficulty: "Easy", questions: 10, time: "20 min", status: "Recommended", progress: 75 },
  ];

  const badges = [
    { name: "Speedster", description: "Completed a test in under 10 minutes", icon: <FaTrophy className="badge-icon" /> },
    { name: "Mastermind", description: "Scored 100% on a quiz", icon: <FaTrophy className="badge-icon" /> },
  ];

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

        <section className="test-grid">
          {tests.map((test, index) => (
            <div key={index} className="test-card">
              <div className="test-header-card">
                <h3>{test.title}</h3>
                <p className="test-subject">{test.subject}</p>
              </div>
              <div className="test-info">
                <p><strong>Difficulty:</strong> {test.difficulty}</p>
                <p><strong>Questions:</strong> {test.questions}</p>
                <p><strong>Time:</strong> {test.time}</p>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div className="progress" style={{ width: `${test.progress}%` }}></div>
                </div>
                <span className="progress-text">{test.progress}%</span>
              </div>
              <button className={`test-btn ${test.status.toLowerCase()}`}>{test.status}</button>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default TestComponent;