const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');

// Helper to notify project members
const notifyProjectMembers = async (io, projectId) => {
  if (!io || !projectId) return;
  try {
    const project = await Project.findById(projectId);
    if (project) {
      io.to(`user_${project.user.toString()}`).emit('data_updated');
      if (project.sharedWith) {
        project.sharedWith.forEach(uId => io.to(`user_${uId.toString()}`).emit('data_updated'));
      }
    }
  } catch(e) {}
};

// GET all tasks for a project
router.get('/project/:projectId', async (req, res) => {
  try {
    const tasks = await Task.find({ projectId: req.params.projectId }).sort({ orderIndex: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE task
router.post('/', async (req, res) => {
  try {
    const task = new Task(req.body);
    const savedTask = await task.save();
    
    await notifyProjectMembers(req.io, savedTask.projectId);

    res.status(201).json(savedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE task
router.put('/:id', async (req, res) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    
    await notifyProjectMembers(req.io, updatedTask.projectId);

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE task
router.delete('/:id', async (req, res) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Task not found' });
    
    await notifyProjectMembers(req.io, deletedTask.projectId);

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
