import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ['active', 'completed'], default: 'active' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payments: [{
    amount: Number,
    status: { type: String, enum: ['paid', 'unpaid'], default: 'unpaid' },
    date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

export default mongoose.model('Project', projectSchema); 