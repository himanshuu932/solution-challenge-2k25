import Test from '../models/test.js';
import User from '../models/User.js';

export const testController = async (req, res) => {
  const { testName, topic, type, level, numberOfQuestions, questions, teacherId } = req.body;
  try {
    const newTest = new Test({
      testName,
      topic,
      type,
      level,
      numberOfQuestions,
      questions,
      teacherId,
    });
  
    await newTest.save();
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save the test." });
  }
};

export const saveTestDetails = async (req, res) => {
  try {
    // Expecting: { userId, testId, status, score, attemptedAt? }
    const { userId, testId, status, score } = req.body;
    console.log("Test Details:", req.body);
    // If attemptedAt is not provided, default to the current date/time
    const attemptedAt = req.body.attemptedAt || new Date();

    // Find the user document
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if a test attempt with the same testId already exists in the user's tests array
    const existingTestIndex = user.tests.findIndex(testAttempt => testAttempt.test.toString() === testId);

    if (existingTestIndex !== -1) {
      // Update the existing test attempt with new details
      user.tests[existingTestIndex].score = score;
      user.tests[existingTestIndex].status = status;
      user.tests[existingTestIndex].attemptedAt = attemptedAt;
    } else {
      // Add a new test attempt object to the tests array
      user.tests.push({ test: testId, status, score, attemptedAt });
    }

    await user.save();
    res.status(200).json({ success: true, tests: user.tests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to save test details." });
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

