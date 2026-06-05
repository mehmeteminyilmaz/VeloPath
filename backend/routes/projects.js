const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

router.use(auth);

router.get('/user/:userId', async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { user: req.params.userId },
        { sharedWith: req.params.userId }
      ]
    }).lean().sort({ createdAt: -1 });

    const projectIds = projects.map(p => p._id);
    const allTasks = await Task.find({ projectId: { $in: projectIds } }).lean();

    const projectsWithTasks = projects.map(project => {
      const projectTasks = allTasks.filter(t => t.projectId.toString() === project._id.toString());
      return { ...project, tasks: projectTasks };
    });

    res.json(projectsWithTasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const requesterId = req.user.userId.toString();
    const isOwner = project.user && project.user.toString() === requesterId;
    const isShared = project.sharedWith && project.sharedWith.some(id => id.toString() === requesterId);

    if (!isOwner && !isShared) {
      return res.status(403).json({ error: 'Bu projeye erisim yetkiniz yok.' });
    }

    const tasks = await Task.find({ projectId: req.params.id }).lean().sort({ orderIndex: 1, createdAt: 1 });
    res.json({ ...project, tasks });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/share', async (req, res) => {
  try {
    const { username } = req.body;
    const User = require('../models/User');
    const userToShareWith = await User.findOne({ username });

    if (!userToShareWith) return res.status(404).json({ message: 'Kullanici bulunamadi' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Proje bulunamadi' });

    if (!project.sharedWith.includes(userToShareWith._id)) {
      project.sharedWith.push(userToShareWith._id);
      await project.save();

      if (req.io) {
        req.io.to('user_' + project.user.toString()).emit('data_updated');
        project.sharedWith.forEach(uId => req.io.to('user_' + uId.toString()).emit('data_updated'));
      }
    }

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const project = new Project({ ...req.body, sharedWith: [] });
    const savedProject = await project.save();

    if (req.io) {
      req.io.to('user_' + savedProject.user.toString()).emit('data_updated');
    }

    res.status(201).json(savedProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProject) return res.status(404).json({ message: 'Project not found' });

    if (req.io) {
      req.io.to('user_' + updatedProject.user.toString()).emit('data_updated');
      if (updatedProject.sharedWith && updatedProject.sharedWith.length > 0) {
        updatedProject.sharedWith.forEach(uId => req.io.to('user_' + uId.toString()).emit('data_updated'));
      }
    }

    res.json(updatedProject);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedProject = await Project.findByIdAndDelete(req.params.id);
    if (!deletedProject) return res.status(404).json({ message: 'Project not found' });

    await Task.deleteMany({ projectId: req.params.id });

    if (req.io) {
      req.io.to('user_' + deletedProject.user.toString()).emit('data_updated');
      if (deletedProject.sharedWith && deletedProject.sharedWith.length > 0) {
        deletedProject.sharedWith.forEach(uId => req.io.to('user_' + uId.toString()).emit('data_updated'));
      }
    }

    res.json({ message: 'Project and associated tasks deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
