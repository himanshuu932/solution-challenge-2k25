
import mongoose from "mongoose";

const Announcements = new mongoose.Schema({
  AnnouncementName: { type: String, required: true },
  topic: { type: String, required: true },
  class: { type: String, required: true},
  teacherId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Announcements", Announcements);