const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');

// GET all projects for a specific user WITH tasks (Optimized)
router.get('/user/:userId', async (req, res) => {
  try {
    const projects = await Project.find({ user: req.params.userId }).lean().sort({ createdAt: -1 });
    
    // Fetch all tasks for these projects in one query
    const projectIds = projects.map(p => p._id);
    const allTasks = await Task.find({ projectId: { $in: projectIds } }).lean();

    // Map tasks to their respective projects
    const projectsWithTasks = projects.map(project => {
      const projectTasks = allTasks.filter(t => t.projectId.toString() === project._id.toString());
      return {
        ...project,
        tasks: projectTasks
      };
    });

    res.json(projectsWithTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all projects (Legacy)
router.get('/', async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single project
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE project
router.post('/', async (req, res) => {
  try {
    const project = new Project(req.body);
    const savedProject = await project.save();
    res.status(201).json(savedProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE project
router.put('/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });
    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE project
router.delete('/:id', async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) return res.status(404).json({ message: 'Project not found' });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
