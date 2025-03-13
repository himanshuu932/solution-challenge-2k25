import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';

export const createClass = async (req, res) => {
  try {
    const { name, students, teachers } = req.body;

    // Create a new class document
    const newClass = new Class({
      name,
      students: students || [],
      teachers: teachers || [],
      announcements: [] // Initialize empty announcements array
    });

    // Save the class to the database
    const savedClass = await newClass.save();

    res.status(201).json(savedClass);
  } catch (error) {
    console.error("Error creating class:", error);
    res.status(500).json({ error: 'Error creating class' });
  }
};

// Fetch class announcements with teacher names (Using req.body)
export const getAnnouncements = async (req, res) => {
    try {
      const { classId } = req.body; // Get class ID from request body
  
      if (!classId) {
        return res.status(400).json({ error: "Class ID is required" });
      }
  
      const classData = await Class.findById(classId)
        .populate("announcements.teacher", "username") // Populate teacher's name
        .exec();
  
      if (!classData) {
        return res.status(404).json({ error: "Class not found" });
      }
  
      // Format announcements properly
      const formattedAnnouncements = classData.announcements.map((announcement) => ({
        message: announcement.message,
        time: announcement.time,
        teacherName: announcement.teacher.username, // Get the teacher's name
      }));
  
      res.json(formattedAnnouncements);
    } catch (error) {
      res.status(500).json({ error: "Error fetching announcements" });
    }
  };

// Add a new announcement
export const addAnnouncement = async (req, res) => {
  try {
    const { classId, teacherId, message } = req.body; // Expecting these fields in the request body

    if (!classId || !teacherId || !message) {
      return res.status(400).json({ error: 'Class ID, Teacher ID, and Message are required' });
    }

    // Check if teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Find the class and add the announcement
    const updatedClass = await Class.findByIdAndUpdate(
      classId,
      {
        $push: {
          announcements: {
            teacher: teacherId,
            message: message,
            time: new Date()
          }
        }
      },
      { new: true } // Return the updated document
    ).populate({
      path: 'announcements.teacher',
      select: 'username email' // Fetch teacher's name and email
    });

    if (!updatedClass) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.status(201).json({ message: 'Announcement added successfully', announcements: updatedClass.announcements });
  } catch (error) {
    console.error("Error adding announcement:", error);
    res.status(500).json({ error: 'Error adding announcement' });
  }
};
export const getAllClasses = async (req, res) => {
    try {
      // Retrieve only the class name and _id fields
      const classes = await Class.find({}, 'name _id');
      res.status(200).json(classes);
    } catch (error) {
      console.error('Error fetching classes:', error);
      res.status(500).json({ error: 'Error fetching classes' });
    }
  };