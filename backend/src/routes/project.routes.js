import express from 'express';
import { auth } from '../middleware/auth.middleware.js';
import Project from '../models/Project.model.js';
import multer from 'multer';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Get all projects
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.userId });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects' });
  }
});

// Create project
router.post('/', auth, async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      userId: req.user.userId
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Error creating project' });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.userId },
      req.body,
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: 'Error updating project' });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.userId
    });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project' });
  }
});

// Import projects from CSV
router.post('/import', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const results = [];
    fs.createReadStream(req.file.path)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        const projects = results.map(project => ({
          ...project,
          userId: req.user.userId
        }));
        await Project.insertMany(projects);
        fs.unlinkSync(req.file.path);
        res.json({ message: 'Projects imported successfully' });
      });
  } catch (error) {
    res.status(400).json({ message: 'Error importing projects' });
  }
});

// Export projects to CSV
router.get('/export', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.userId });
    const csvWriter = createObjectCsvWriter({
      path: 'exports/projects.csv',
      header: [
        { id: 'name', title: 'Name' },
        { id: 'dueDate', title: 'Due Date' },
        { id: 'status', title: 'Status' }
      ]
    });

    await csvWriter.writeRecords(projects);
    res.download('exports/projects.csv', 'projects.csv', (err) => {
      if (err) {
        res.status(500).json({ message: 'Error downloading file' });
      }
      fs.unlinkSync('exports/projects.csv');
    });
  } catch (error) {
    res.status(500).json({ message: 'Error exporting projects' });
  }
});

// Add payment to project
router.post('/:id/payments', auth, async (req, res) => {
  try {
    const { amount, date, description, status } = req.body;
    
    // Enhanced validation
    if (!amount || isNaN(parseFloat(amount))) {
      return res.status(400).json({ message: 'Valid amount is required' });
    }
    if (!date) {
      return res.status(400).json({ message: 'Date is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ message: 'Description is required' });
    }
    if (status && !['pending', 'paid'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const newPayment = {
      amount: parseFloat(amount),
      date: new Date(date),
      description: description.trim(),
      status: status || 'pending'
    };

    project.payments.push(newPayment);
    await project.save();

    res.status(201).json(project.payments[project.payments.length - 1]);
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(400).json({ 
      message: 'Error adding payment',
      error: error.message
    });
  }
});

// Delete payment from project
router.delete('/:projectId/payments/:paymentId', auth, async (req, res) => {
  try {
    console.log('Attempting to delete payment:', {
      projectId: req.params.projectId,
      paymentId: req.params.paymentId
    });

    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Find the payment index
    const paymentIndex = project.payments.findIndex(
      payment => payment._id.toString() === req.params.paymentId
    );

    if (paymentIndex === -1) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Remove the payment using splice
    project.payments.splice(paymentIndex, 1);

    // Save with validation disabled for this operation
    await project.save({ validateBeforeSave: false });

    console.log('Payment deleted successfully');
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Payment deletion error:', error);
    res.status(500).json({ 
      message: 'Error deleting payment',
      error: error.message
    });
  }
});

// Update payment status
router.put('/:projectId/payments/:paymentId', auth, async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.projectId,
      userId: req.user.userId
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const payment = project.payments.id(req.params.paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    payment.status = req.body.status;
    await project.save();

    res.json(payment);
  } catch (error) {
    console.error('Payment status update error:', error);
    res.status(400).json({ 
      message: 'Error updating payment status',
      error: error.message 
    });
  }
});

export default router; 