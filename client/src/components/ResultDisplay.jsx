import React from "react";

function ResultDisplay({ score }) {
  return (
    <div className="results">
      <h2>Test Completed!</h2>
      <p className="score">Your Score: {score}</p>
      <p className="feedback">Keep practicing and improve your skills.</p>
    </div>
  );
}

export default ResultDisplay;
