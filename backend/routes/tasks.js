const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const Project = require('../models/Project');
const auth = require('../middleware/auth');

router.use(auth);

router.use((req, res, next) => {
  if (req.body && req.body.subtasks && Array.isArray(req.body.subtasks)) {
    req.body.subtasks = req.body.subtasks.map(s => {
      const text = s.text || s.title || '';
      const title = s.title || s.text || '';
      return { ...s, text, title };
    });
  }
  next();
});

const notifyProjectMembers = async (io, projectId) => {
  if (!io || !projectId) return;
  try {
    const project = await Project.findById(projectId);
    if (project) {
      io.to('user_' + project.user.toString()).emit('data_updated');
      if (project.sharedWith) {
        project.sharedWith.forEach(uId => io.to('user_' + uId.toString()).emit('data_updated'));
      }
    }
  } catch(e) { console.error('notifyProjectMembers error:', e.message); }
};

function calcNextDue(recurrence, from) {
  const d = new Date(from || Date.now());
  const n = recurrence.interval || 1;
  if (recurrence.type === 'daily')   d.setDate(d.getDate() + n);
  if (recurrence.type === 'weekly')  d.setDate(d.getDate() + n * 7);
  if (recurrence.type === 'monthly') d.setMonth(d.getMonth() + n);
  return d;
}

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
    const body = { ...req.body };
    if (body.project && !body.projectId) {
      body.projectId = body.project;
      delete body.project;
    }
    const task = new Task(body);
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

// TOGGLE task status
router.put('/:id/toggle', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isNowDone = task.status !== 'done';

    if (isNowDone) {
      task.completedAt = new Date();
      if (task.recurrence && task.recurrence.type) {
        task.recurrence.lastReset = new Date();
        task.dueDate = calcNextDue(task.recurrence, new Date());
        task.status = 'done';
        const savedTask = await task.save();
        await notifyProjectMembers(req.io, savedTask.projectId);
        return res.json({ ...savedTask.toObject(), recurred: true });
      }
      task.status = 'done';
    } else {
      task.status = 'todo';
      task.completedAt = null;
    }

    const updatedTask = await task.save();
    await notifyProjectMembers(req.io, updatedTask.projectId);
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// RESET recurring task
router.put('/:id/reset-recurring', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.status = 'todo';
    task.completedAt = null;
    const updated = await task.save();
    await notifyProjectMembers(req.io, updated.projectId);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ADD comment
router.post('/:id/comments', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ error: 'Yorum metni gerekli.' });

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.comments.push({
      userId: req.user.userId,
      username: req.user.username,
      text: text.trim(),
    });

    const updatedTask = await task.save();
    await notifyProjectMembers(req.io, updatedTask.projectId);
    res.status(201).json(updatedTask.comments[updatedTask.comments.length - 1]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE comment
router.delete('/:id/comments/:commentId', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = task.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    // Sadece kendi yorumunu silebilir
    if (comment.userId.toString() !== req.user.userId.toString()) {
      return res.status(403).json({ error: 'Bu yorumu silme yetkiniz yok.' });
    }

    comment.deleteOne();
    await task.save();
    await notifyProjectMembers(req.io, task.projectId);
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
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
