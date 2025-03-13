import mongoose from 'mongoose';
const { Schema } = mongoose;

// Define a sub-schema for test attempts
const testAttemptSchema = new Schema({
  // Reference to the Test document
  test: { type: Schema.Types.ObjectId, ref: 'Test', required: true },
  // Status can be 'attempted' or 'not_attempted'
  status: { type: String, enum: ['attempted', 'not_attempted'], default: 'not_attempted' },
  // Score achieved in the test
  score: { type: Number, default: 0 },
  // Date and time when the test was attempted
  attemptedAt: { type: Date }
});

const userSchema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // Single ObjectId referencing the class this student belongs to
  class: { type: Schema.Types.ObjectId, ref: 'Class', required: true },
  // Array of test attempts
  tests: [testAttemptSchema]
});

export default mongoose.model('User', userSchema);
