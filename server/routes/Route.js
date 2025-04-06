import express from 'express';
import multer from 'multer';
import { signup, login, getNotifications,deleteNotification,getProfile } from '../controllers/authControllers.js';
import { generateQuestion } from '../controllers/questionController.js';
import { testController, saveTestDetails, fetchTestDetails } from '../controllers/testController.js';
import { evaluateController } from '../controllers/evaluateController.js';
import { selfEvaluationController } from '../controllers/selfEvaluationController.js';
import User from '../models/User.js';
import test from '../models/test.js';
import { handlePdfUpload } from '../controllers/pdfhandler.js';
import { examevaluateController } from '../controllers/examevaluateController.js';
import { studentOwnTest } from '../controllers/studentOwnTestController.js';
import { evaluateFilesController } from '../controllers/evaluatemecontroller.js';


const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/generate-questions', generateQuestion);
router.post("/tests", testController);
router.get("/profile/:id", getProfile);
router.post('/evaluateShortAnswers', evaluateController);
router.post('/selfEvaluation', selfEvaluationController);
router.get('/:userId/notifications', getNotifications);
// DELETE notification route: DELETE /api/auth/:userId/notifications/:notificationId
router.delete('/:userId/notifications/:notificationId', deleteNotification);




const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Save files in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // Unique filename
  },
});

const upload = multer({ storage });


router.get("/tests", async (req, res) => {
  try {
    const { teacherId, studentId } = req.query;
    let query = {};

    if (teacherId) {
      // Fetch tests created by the specific teacher
      query.teacherId = teacherId;
    } 
    else if (studentId) {
      // Get student with populated class information
      const student = await User.findById(studentId).populate('class', 'name');
      
      if (!student) {
        return res.status(404).json({ success: false, message: "Student not found." });
      }
      
      if (!student.class) {
        return res.status(400).json({ 
          success: false, 
          message: "Student has no class assigned." 
        });
      }

      // Filter tests by the class name
      query.level = student.class.name;
    }
    else {
      // If neither teacherId nor studentId provided
      return res.status(400).json({
        success: false,
        message: "Either teacherId or studentId must be provided"
      });
    }

    const tests = await test.find(query);
    res.json({ success: true, tests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch tests.",
      error: err.message 
    });
  }
});


router.post("/tests/:testId/attempt", async (req, res) => {
  const { testId } = req.params;
  const { studentId } = req.body; // Student ID should be passed in the request body
console.log("these are all the details: "+ testId+" , "+studentId);
  try {
    // Find the test by ID
    const Test = await test.findById(testId);
    if (!Test) {
      return res.status(404).json({ success: false, message: "Test not found." });
    }

    // Check if the student has already attempted the test
    if (Test.attemptedBy.includes(studentId)) {
      return res.status(400).json({ success: false, message: "Student has already attempted this test." });
    }

    // Add the student ID to the attemptedBy array
    Test.attemptedBy.push(studentId);
    await Test.save();

    res.json({ success: true, message: "Test attempt recorded successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to record test attempt." });
  }
});

// routes/user.js
router.post("/students", async (req, res) => {
  const { studentIds } = req.body; // Array of student IDs

  try {
    const students = await User.find({ _id: { $in: studentIds } }, "username email"); // Fetch only username and email
    res.json({ success: true, students });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch student details." });
  }
});


router.get("/student-performance", async (req, res) => {
  try {
    const { studentId, testId } = req.query;

    // Fetch the student details
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Find the test performance for the specified test
    const testPerformance = student.tests.find(
      (test) => test.test.toString() === testId
    );

    if (!testPerformance) {
      return res.status(404).json({ error: "Test performance not found" });
    }

    // Prepare the response
    const response = {
      studentName: student.username,
      testId: testPerformance.test,
      status: testPerformance.status,
      score: testPerformance.score,
      totalQuestions: testPerformance.totalQuestions,
      correctAnswers: testPerformance.correctAnswers,
      incorrectAnswers: testPerformance.incorrectAnswers,
      attemptedAt: testPerformance.attemptedAt,
      timeTaken: testPerformance.timeTaken,
      answers: testPerformance.answers, // Array of question-wise performance
    };

    res.status(200).json({ performance: response });
  } catch (err) {
    console.error("Error fetching student performance:", err);
    res.status(500).json({ error: "Failed to fetch student performance" });
  }
});


router.get('/performance/:userId', studentOwnTest);


router.post(
  "/exam-evaluate",
  upload.fields([
    { name: "questionFile", maxCount: 1 },
    { name: "studentAnswerFile", maxCount: 1 },
    { name: "correctAnswerFile", maxCount: 1 },
  ]),
  examevaluateController
);

router.post('/upload-pdf', upload.single('file'), async (req, res) => {
  try {
    const { studentId } = req.body; // Assuming the student ID is available in the request
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "No file uploaded." });
    }
   // console.log("this is the student id coming:", studentId);
    const result = await handlePdfUpload(file, studentId);
    res.json(result);
  } catch (error) {
    console.error("Error in /upload-pdf:", error);
    res.status(500).json({ error: "Failed to process file." });
  }
});




router.post('/evaluate-answer', express.json(), evaluateFilesController);



// New routes for saving and fetching test attempt details
router.post("/test-details", saveTestDetails);
router.get("/test-details", fetchTestDetails);

export default router;
