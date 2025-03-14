import express from 'express';
import { signup, login, getNotifications,deleteNotification } from '../controllers/authControllers.js';
import { generateQuestion } from '../controllers/questionController.js';
import { testController, saveTestDetails, fetchTestDetails } from '../controllers/testController.js';
import { evaluateController } from '../controllers/evaluateController.js';
import { selfEvaluationController } from '../controllers/selfEvaluationController.js';
import test from '../models/test.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/generate-questions', generateQuestion);
router.post("/tests", testController);
router.post('/evaluateShortAnswers', evaluateController);
router.post('/selfEvaluation', selfEvaluationController);
router.get('/:userId/notifications', getNotifications);
// DELETE notification route: DELETE /api/auth/:userId/notifications/:notificationId
router.delete('/:userId/notifications/:notificationId', deleteNotification);

router.get("/tests", async (req, res) => {
    try {
      // Fetch all tests from the database
      const tests = await test.find({}); // Adjust the query as needed
      res.json({ success: true, tests });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Failed to fetch tests." });
    }
});

// New routes for saving and fetching test attempt details
router.post("/test-details", saveTestDetails);
router.get("/test-details", fetchTestDetails);

export default router;
