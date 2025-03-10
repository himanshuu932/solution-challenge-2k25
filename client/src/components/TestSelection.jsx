import React from "react";
import "./styles/TestSelection.css";

function TestSelection({ difficulty, setDifficulty, startTest }) {
  return (
    <div className="test-selection">
      <h2>Select Your Test</h2>
      <label>Difficulty Level:</label>
      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>
      <button className="start-test-btn" onClick={startTest}>Start Test</button>
    </div>
  );
}

export default TestSelection;