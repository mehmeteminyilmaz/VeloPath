const mongoose = require('mongoose');

const subtaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const taskSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  title: { type: String, required: true },
  status: { type: String, default: 'todo', enum: ['todo', 'in-progress', 'done'] },
  priority: { type: String, default: 'medium', enum: ['low', 'medium', 'high'] },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  subtasks: [subtaskSchema],
  dependencies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }],
  isLocked: { type: Boolean, default: false },
  weekIndex: { type: Number, default: 0 },
  orderIndex: { type: Number, default: 0 } // For drag and drop sorting
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
