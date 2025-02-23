import React from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

function QuestionDisplay({ question, selectedOption, setSelectedOption, timeUp, setTimeUp }) {
  return (
    <div className="test-content">
      <h3 className="question-box">Question: {question}</h3>
      <div className="option-box">
        <select value={selectedOption} onChange={(e) => setSelectedOption(e.target.value)}>
          <option value="">Select an answer</option>
          <option value="1">Answer 1</option>
          <option value="2">Answer 2</option>
          <option value="3">Answer 3</option>
        </select>
      </div>
      <div className="timer">
        <CountdownCircleTimer
          isPlaying
          duration={10}
          colors={[["#4caf50", 0.5], ["#ff9800", 0.3], ["#f44336", 0.2]]}
          size={100}
          onComplete={() => setTimeUp(true)}
        >
          {({ remainingTime }) => <div>{remainingTime}s</div>}
        </CountdownCircleTimer>
      </div>
      {timeUp && <div className="time-up">Time’s up!</div>}
    </div>
  );
}

export default QuestionDisplay;
