// server/routes/authRoutes.js
import express from 'express';
import { signup, login } from '../controllers/authControllers.js';
import { generateQuestion } from '../controllers/questionController.js';
import { testController } from '../controllers/testController.js';
import { evaluateController } from '../controllers/evaluateController.js';
import test from '../models/test.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/generate-questions', generateQuestion);
router.post("/tests",testController);
router.post('/evaluateShortAnswers', evaluateController);
router.get("/tests", async (req, res) => {
    try {
      // Fetch all tests from the database
      const tests = await test.find({}); // Adjust the query as needed
      res.json({ success: true, tests }); // Send the tests as a JSON response
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Failed to fetch tests." });
    }
  });

export default router;
