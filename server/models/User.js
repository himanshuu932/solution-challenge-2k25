import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define a sub-schema for test attempts
const testAttemptSchema = new Schema({
  test: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
  status: { type: String, enum: ['attempted', 'not_attempted'], default: 'not_attempted' },
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, required: true }, // Total number of questions in the test
  correctAnswers: { type: Number, default: 0 }, // Number of correct answers
  incorrectAnswers: { type: Number, default: 0 }, // Number of incorrect answers
  attemptedAt: { type: Date, default: Date.now }, // Timestamp of the attempt
  timeTaken: { type: Number, default: 0 }, // Time taken to complete the test in seconds
  answers: [{ // Array of answers provided by the student
    questionId: { type: Number, required: true },
    selectedOption: { type: String }, // For MCQ
    answerText: { type: String }, // For short/long answer
    isCorrect: { type: Boolean, default: false }
  }]
});

// Define a sub-schema for notifications
const notificationSchema = new Schema({
  requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  donation: { type: Schema.Types.ObjectId, ref: 'Donation', required: true },
  createdAt: { type: Date, default: Date.now }
});

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  tests: [testAttemptSchema],
  notifications: [notificationSchema]
});

export default mongoose.model('User', userSchema);
