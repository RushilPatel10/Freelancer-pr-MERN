import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount must be positive']
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [1, 'Description cannot be empty']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'paid'],
      message: '{VALUE} is not a valid status'
    },
    default: 'pending'
  }
}, { timestamps: true });

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dueDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed'],
    default: 'active'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  payments: [paymentSchema]
}, { 
  timestamps: true,
  validateBeforeSave: true
});

projectSchema.pre('save', function(next) {
  if (this.payments) {
    this.payments = this.payments.filter(payment => {
      return payment.amount && payment.date && payment.description;
    });
  }
  next();
});

export default mongoose.model('Project', projectSchema); 