import Test from '../models/test.js';
import User from '../models/User.js';

export const testController = async (req, res) => {
  const { testName, topic, type, level, numberOfQuestions, questions, teacherId, time } = req.body;
  try {
    const newTest = new Test({
      testName,
      topic,
      type,
      level,
      numberOfQuestions,
      questions,
      teacherId,
      time,
    });
  
    await newTest.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save the test." });
  }
};

export const saveTestDetails = async (req, res) => {
  const { userId, testId, status, score, totalQuestions, correctAnswers, incorrectAnswers, timeTaken, answers } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check if the test attempt already exists
    const existingAttempt = user.tests.find((attempt) => attempt.test.toString() === testId);

    if (existingAttempt) {
      // Update the existing attempt
      existingAttempt.status = status;
      existingAttempt.score = score;
      existingAttempt.totalQuestions = totalQuestions;
      existingAttempt.correctAnswers = correctAnswers;
      existingAttempt.incorrectAnswers = incorrectAnswers;
      existingAttempt.timeTaken = timeTaken;
      existingAttempt.answers = answers;
      existingAttempt.attemptedAt = new Date();
    } else {
      // Add a new test attempt
      user.tests.push({
        test: testId,
        status: status,
        score: score,
        totalQuestions: totalQuestions,
        correctAnswers: correctAnswers,
        incorrectAnswers: incorrectAnswers,
        timeTaken: timeTaken,
        answers: answers,
        attemptedAt: new Date(),
        time:timeTaken,
      });
    }

    // Save the updated user document
    await user.save();
    res.status(200).json({ success: true, message: 'Test attempt updated successfully' });
  } catch (error) {
    console.error('Error updating test details:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const fetchTestDetails = async (req, res) => {
  try {
    // Expecting the userId to be passed as a query parameter, e.g., /test-details?userId=...
    const { userId } = req.query;
    const user = await User.findById(userId)
      .populate('tests.test', '_id') // Only populate the _id field for tests
      .exec();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Filter tests that have been attempted (i.e., where score is defined)
    const attemptedTests = user.tests.filter(testAttempt => testAttempt.score !== undefined && testAttempt.score !== null);

    // Map to an array of test IDs only
    const testIds = attemptedTests.map(testAttempt => testAttempt.test._id);

    res.status(200).json({ success: true, tests: testIds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch test details." });
  }
};

