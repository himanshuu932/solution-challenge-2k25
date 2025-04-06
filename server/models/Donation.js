import mongoose from 'mongoose';
const { Schema } = mongoose;

const donationSchema = new Schema({
  item: { type: String, required: true },
 
  type: { 
    type: String, 
    required: true, 
    enum: ['Book', 'Equipment', 'Stationery', 'Other'] 
  },
 
  tags: [{ type: String }],
  description: { type: String },
  // Reference to the user who donated
  donatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Donation', donationSchema);
