import mongoose from 'mongoose';
const { Schema } = mongoose;

const classSchema = new Schema({
  name: { type: String, required: true },
  
  // Array of ObjectIds referencing students (from the User schema)
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],

  // Array of ObjectIds referencing teachers (from the Teacher schema)
  teachers: [{ type: Schema.Types.ObjectId, ref: 'Teacher' }],

  // Array of announcements
  announcements: [
    {
      teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' }, // Reference to the teacher who made the announcement
      message: { type: String, required: true },
      time: { type: Date, default: Date.now }
    }
  ]
});

export default mongoose.model('Class', classSchema);
