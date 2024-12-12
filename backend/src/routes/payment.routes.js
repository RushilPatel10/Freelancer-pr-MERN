import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import Project from '../models/Project.model.js';

const router = express.Router();

// Add payment to project
router.post('/:projectId', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.projectId, userId: req.user.userId },
      { $push: { payments: req.body } },
      { new: true }
    );
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update payment status
router.put('/:projectId/:paymentId', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { 
        _id: req.params.projectId, 
        userId: req.user.userId,
        'payments._id': req.params.paymentId 
      },
      { $set: { 'payments.$.status': req.body.status } },
      { new: true }
    );
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 