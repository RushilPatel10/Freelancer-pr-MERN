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
    res.status(400).json({ message: error.message });
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
    res.status(400).json({ message: error.message });
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
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.download('exports/projects.csv');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Import projects from CSV
router.post('/import', auth, upload.single('file'), async (req, res) => {
  try {
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
        res.json({ message: 'Import successful' });
      });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router; 