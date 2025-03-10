import Test from '../models/test.js';

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